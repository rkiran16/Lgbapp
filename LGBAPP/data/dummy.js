import Posting from '../models/posting';

// export const Post = [
//     new Posting(
//       '0001',
//       {
//         _id: {"$oid":"5d3b5211f578566631d5a265"},
//         block: "No",
//         name: "New In Town",
//         url: "newintown",
//         createdAt: '2019-07-26T19:18:10.188+00:00'
//       },
//       {
//           _id: '5d4df5dd4827741bf97ed038',
//           imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
//           userName: 'Tolu Systems'
//       },
//       'Spaghetti with Tomato Sauce',
//       'Cut the tomatoes and the onion into small pieces.',
//       'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
//       20.00,
//       5,
//       [
//         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
//         'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
//         'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
//         'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
//       ],
//       'services',
//       ['Travel', 'Tents', 'homestay', 'weekends'],
//       false,
//       '2019-08-06T23:55:23.165+00:00'
//     ),
//     new Posting(
//         '0002',
//         {
//             _id: {"$oid":"5d3b51f2f578566631d5a264"},
//             block: "No",
//             name: "Clothings/Designers",
//             url: "clothingsdesigners",
//             createdAt: '2019-07-26T19:18:10.188+00:00'
//         },
//         {
//             _id: '5d4df5dd4827741bf97ed038',
//             imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
//             userName: 'Tolu Systems'
//         },
//         'Spaghetti with Tomato Sauce',
//         'Cut the tomatoes and the onion into small pieces.',
//         'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
//         180.00,
//         1,
//         [
//           'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
//           'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
//           'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
//           'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
//         ],
//         'services',
//         ['Food', 'Misc'],
//         false,
//         '2019-08-06T23:55:23.165+00:00'
//       ),
//       new Posting(
        // '0003',
        // {
        //     _id: {"$oid":"5d3b5211f578566631d5a265"},
        //     block: "No",
        //     name: "New In Town",
        //     url: "newintown",
        //     createdAt: '2019-07-26T19:18:10.188+00:00'
        // },
        // {
        //     _id: '5d4df5dd4827741bf97ed038',
        //     imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
        //     userName: 'Tolu Systems'
        // },
        // 'Spaghetti with Tomato Sauce',
        // 'Cut the tomatoes and the onion into small pieces.',
        // 'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
        // 40.00,
        // 0,
        // [
        //     'https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?fit=crop&w=240&q=80',
        //     'https://images.unsplash.com/photo-1543747579-795b9c2c3ada?fit=crop&w=240&q=80',
        //     'https://images.unsplash.com/photo-1551798507-629020c81463?fit=crop&w=240&q=80',
        //     'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=240&q=80',
        //     'https://images.unsplash.com/photo-1503642551022-c011aafb3c88?fit=crop&w=240&q=80'
        // ],
        // 'services',
        // ['Food', 'Misc'],
        // false,
        // '2019-08-06T23:55:23.165+00:00'
//       ),
//       new Posting(
        // '0004',
        // {
        //     _id: {"$oid":"5d3b51f2f578566631d5a264"},
        //     block: "No",
        //     name: "Clothings/Designers",
        //     url: "clothingsdesigners",
        //     createdAt: '2019-07-26T19:18:10.188+00:00'
        // },
        // {
        //     _id: '5d4a136bb39a6b3c2938fa31',
        //     imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
        //     userName: 'Tolu Systems'
        // },
        // 'Spaghetti with Tomato Sauce',
        // 'Cut the tomatoes and the onion into small pieces.',
        // 'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
        // 20.00,
        // 5,
        // [
        //   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
        //   'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
        //   'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
        //   'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
        // ],
        // 'services',
        // ['Travel', 'Tents', 'homestay', 'weekends'],
        // false,
        // '2019-08-06T23:55:23.165+00:00'
//       ),
// ]

const POSTS = [
  new Posting(
    '0001',
    {
      _id: {"$oid":"5d3b5211f578566631d5a265"},
      block: "No",
      name: "New In Town",
      url: "newintown",
      createdAt: '2019-07-26T19:18:10.188+00:00'
    },
    {
      _id: '5d4df5dd4827741bf97ed038',
      imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
      userName: 'Tolu Systems'
    },
    'Spaghetti with Tomato Sauce',
    'Cut the tomatoes and the onion into small pieces.',
    'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
    20.00,
    5,
    [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
      'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
      'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
      'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
    ],
    'services',
    ['Travel', 'Tents', 'homestay', 'weekends'],
    false,
    '2019-08-06T23:55:23.165+00:00'
  ),
  new Posting(
    '0002',
    {
        _id: {"$oid":"5d3b51f2f578566631d5a264"},
        block: "No",
        name: "Clothings/Designers",
        url: "clothingsdesigners",
        createdAt: '2019-07-26T19:18:10.188+00:00'
    },
    {
        _id: '5d4df5dd4827741bf97ed038',
        imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
        userName: 'Tolu Systems'
    },
    'Spaghetti with Tomato Sauce',
    'Cut the tomatoes and the onion into small pieces.',
    'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
    180.00,
    1,
    [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
      'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
      'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
      'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
    ],
    'services',
    ['Food', 'Misc'],
    false,
    '2019-08-06T23:55:23.165+00:00'
  ),
  new Posting(
    '0003',
    {
        _id: {"$oid":"5d3b5211f578566631d5a265"},
        block: "No",
        name: "New In Town",
        url: "newintown",
        createdAt: '2019-07-26T19:18:10.188+00:00'
    },
    {
        _id: '5d4df5dd4827741bf97ed038',
        imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
        userName: 'Tolu Systems'
    },
    'Spaghetti with Tomato Sauce',
    'Cut the tomatoes and the onion into small pieces.',
    'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
    40.00,
    0,
    [
        'https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?fit=crop&w=240&q=80',
        'https://images.unsplash.com/photo-1543747579-795b9c2c3ada?fit=crop&w=240&q=80',
        'https://images.unsplash.com/photo-1551798507-629020c81463?fit=crop&w=240&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=240&q=80',
        'https://images.unsplash.com/photo-1503642551022-c011aafb3c88?fit=crop&w=240&q=80'
    ],
    'services',
    ['Food', 'Misc'],
    false,
    '2019-08-06T23:55:23.165+00:00'
  ),
  new Posting(
    '0004',
    {
        _id: {"$oid":"5d3b51f2f578566631d5a264"},
        block: "No",
        name: "Clothings/Designers",
        url: "clothingsdesigners",
        createdAt: '2019-07-26T19:18:10.188+00:00'
    },
    {
        _id: '5d4a136bb39a6b3c2938fa31',
        imgUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80',
        userName: 'Tolu Systems'
    },
    'Spaghetti with Tomato Sauce',
    'Cut the tomatoes and the onion into small pieces.',
    'Lorep Ipsum when cut is big Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces. Cut the tomatoes and the onion into small pieces.',
    20.00,
    5,
    [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg',
      'https://images.pexels.com/photos/160834/coffee-cup-and-saucer-black-coffee-loose-coffee-beans-160834.jpeg?cs=srgb&dl=bean-beans-black-coffee-160834.jpg&fm=jpg',
      'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?cs=srgb&dl=blur-blurred-book-pages-46274.jpg&fm=jpg',
      'https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg'
    ],
    'services',
    ['Travel', 'Tents', 'homestay', 'weekends'],
    false,
    '2019-08-06T23:55:23.165+00:00'
  ),
  // new Product(
  //   'p5',
  //   'u3',
  //   'PowerBook',
  //   'https://get.pxhere.com/photo/laptop-computer-macbook-mac-screen-water-board-keyboard-technology-air-mouse-photo-airport-aircraft-tablet-aviation-office-black-monitor-keys-graphic-hardware-image-pc-exhibition-multimedia-calculator-vector-water-cooling-floppy-disk-phased-out-desktop-computer-netbook-personal-computer-computer-monitor-electronic-device-computer-hardware-display-device-448748.jpg',
  //   'Awesome hardware, crappy keyboard and a hefty price. Buy now before a new one is released!',
  //   2299.99
  // ),
  // new Product(
  //   'p6',
  //   'u1',
  //   'Pen & Paper',
  //   'https://cdn.pixabay.com/photo/2015/10/03/02/14/pen-969298_1280.jpg',
  //   "Can be used for role-playing (not the kind of role-playing you're thinking about...).",
  //   5.49
  // )
];

export default POSTS;
