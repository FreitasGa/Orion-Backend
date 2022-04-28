/* eslint-disable no-unsafe-finally */
/* eslint-disable no-console */
import fetch from 'node-fetch';

const wakeDyno = (url: string, interval: number) => {
  const milliseconds = interval * 60000;
  setTimeout(() => {
    try {
      console.log('setTimeout called.');
      fetch(url).then(() => console.log(`Fetching ${url}.`));
    } catch (error) {
      console.log(`Error fetching ${url}: ${error.message}
      Will try again in ${interval} minutes...`);
    } finally {
      return wakeDyno(url, interval);
    }
  }, milliseconds);
};

export default wakeDyno;
