const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(cors());

const url =
  'https://gg.deals/deals/?minRating=6&onlyHistoricalLow=1&sort=date&store=4';

async function scrapeWebsite() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const result = [];

    $('.game-list-item').each((index, element) => {
      const title = $(element).find('.game-info-title').text().trim();
      const currentPrice = $(element).find('.game-price-new').text().trim();
      const previousPrice = $(element).find('.price-old').text().trim();
      const endDay = $(element).find('.timesince').text().trim() || '';
      const dealRating = $(element).find('.deal-rating-label').text().trim();
      const discount = $(element).find('span.discount').text().trim();
      const link = $(element).find('.shop-link').attr('href');
      const image = $(element).find('.main-image img').attr('src');

      if (
        title &&
        currentPrice &&
        previousPrice &&
        endDay &&
        dealRating &&
        discount &&
        link &&
        image
      ) {
        result.push({
          title,
          currentPrice,
          previousPrice,
          endDay,
          dealRating,
          discount,
          link,
          image,
        });
      }
    });

    return result;
  } catch (error) {
    throw new Error('Error while scraping:', error);
  }
}

app.get('/scrape', async (req, res) => {
  try {
    const result = await scrapeWebsite();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
