// CloudFront Function (viewer request), runtime cloudfront-js-2.0.
//
// Why: Next.js static export with `trailingSlash: true` writes pages as
// `members/israel/index.html`. CloudFront only applies the default root object
// ("index.html") at "/", so without this, "/members/israel/" would 404.
//
//   /members/israel/   -> serve /members/israel/index.html
//   /members/israel    -> 301 redirect to /members/israel/ (one canonical URL, better for SEO)
//   /_next/static/x.js -> unchanged (has a file extension)
//
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
      headers: { location: { value: uri + "/" } },
    };
  }

  return request;
}
