// import React from 'react';
// import { render } from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Didact from './Didact';

// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// );

const element = Didact.createElement(
  'div',
  {
    id: 'foo',
  },
  'foo',
  Didact.createElement('a', null, 'bar'),
  Didact.createElement('b'),
)

console.log('element----', element);
const container = document.getElementById("root")
Didact.render(element, container)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
