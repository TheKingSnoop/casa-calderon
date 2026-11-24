// CloudFront Function (viewer request), runtime cloudfront-js-2.0.
//
// Why: Next.js static export with `trailingSlash: true` writes pages as
// `members/israel/index.html`. CloudFront only applies the default root object
// ("index.html") at "/", so without this, "/members/israel/" would 404.
//
//   /members/israel/       -> serve /members/israel/index.html
//   /members/israel        -> 301 redirect to /members/israel/ (one canonical URL, better for SEO)
//   /projects?member=marcy -> 301 redirect to /projects/?member=marcy (query string kept)
//   /_next/static/x.js     -> unchanged (has a file extension)
//
// scripts/serve-static.ts mirrors this behaviour for the end-to-end tests.
// Runs at the edge on every request. Free tier: 2,000,000 invocations/month.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
    return request;
  }

  var lastSegment = uri.split("/").pop();
  if (!lastSegment.includes(".")) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: uri + "/" + queryString(request.querystring) },
      },
    };
  }

  return request;
}

// CloudFront passes the query string as an object:
//   { member: { value: "marcy" }, tag: { value: "a", multiValue: [{ value: "a" }, { value: "b" }] } }
// Rebuild "?member=marcy&tag=a&tag=b" (values are passed through as received).
function queryString(querystring) {
  var parts = [];
  for (var key in querystring || {}) {
    var entry = querystring[key];
    var values = entry.multiValue
      ? entry.multiValue.map(function (item) {
          return item.value;
        })
      : [entry.value];
    values.forEach(function (value) {
      parts.push(value === "" ? key : key + "=" + value);
    });
  }
  return parts.length > 0 ? "?" + parts.join("&") : "";
}
