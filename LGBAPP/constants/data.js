import React from 'react'

const defaultCatMenu = [
    { id: '1', title: 'FOOD', imgsrc: 'ProfilePicture'},
    { id: '2', title: 'PEOPLE', imgsrc: 'ProfilePicture'},
    { id: '3', title: 'GETAWAY', imgsrc: 'ProfilePicture'},
    { id: '4', title: 'CATEGORY1', imgsrc: 'ProfilePicture'},
    { id: '1', title: 'CATEGORY2', imgsrc: 'ProfilePicture'},
    { id: '2', title: 'CATEGORY3', imgsrc: 'ProfilePicture'},
    { id: '3', title: 'CATEGORY4', imgsrc: 'ProfilePicture'},
    { id: '4', title: 'CATEGORY5', imgsrc: 'ProfilePicture'},
  ];

export default class AppData extends React.Component {
    static defaultProps = {
      data: defaultMenu,
      initialIndex: null,
    }
  
    state = {
      active: null,
    }
}