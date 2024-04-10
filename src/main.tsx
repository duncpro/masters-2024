import { createRoot } from 'react-dom/client';
import * as React from 'react';

const rootel = document.getElementById('root');
const rroot = createRoot(rootel);

rroot.render((
  <>
    <span>Hello World</span>
  </>
));
