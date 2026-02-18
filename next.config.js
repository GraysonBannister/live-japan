const withNextIntl = require('next-intl/plugin')('./app/i18n/request.tsx');

module.exports = withNextIntl({
  images: {
    unoptimized: true,
  },
});
