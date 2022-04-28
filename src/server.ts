import { http } from './app';
import '@websocket/Dependent';
import '@websocket/Responsible';

import wakeDyno from './wakeDyno';

const dynoURL = 'https://orion-backend-test.herokuapp.com';

http.listen(process.env.PORT || 3000, () => {
  console.log('Server Running');
  wakeDyno(dynoURL, 30);
});
