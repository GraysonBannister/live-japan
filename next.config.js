const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  output: 'export',
  images: {
    unoptimized: true,
  },
});
