// Api for the oembed specification
// https://oembed.com

const DEFAULT_WIDTH = 500
const DEFAULT_HEIGHT = 500

const validateUrl = (url) => {
  return url.match(/^https?:\/\/texblocks.com\/embed/)
}

module.exports = (req, res) => {
  const {
    url,
    format,
    maxwidth = DEFAULT_WIDTH,
    maxheight = DEFAULT_HEIGHT,
  } = req.query
  const width = Math.min(maxwidth, DEFAULT_WIDTH)
  const height = Math.min(maxheight, DEFAULT_HEIGHT)

  if (format !== 'json') {
    res.statusCode = 501; // Not Implemented
    res.end()
    return
  }

  if (process.env['NODE_ENV'] !== 'development' && !validateUrl(url)) {
    res.statusCode = 401; // Unauthorized
    res.end()
    return
  }

  res.json({
    type: 'rich',
    version: '1.0',
    title: 'tex block',
    html: `<iframe width="${width}px" height="${height}px" frameBorder="0" src="${decodeURI(url)}"></iframe>`,
    width,
    height
  })
}
