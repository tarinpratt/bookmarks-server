function makeBookmarksArray () {
    return [{
        id: 1,
        title: 'Thinkful',
        url: 'https://www.thinkful.com',
        rating: 5,
        description: 'Think outside the classroom'
      },
    {
        id: 2,
        title: 'Google',
        url: 'https://www.google.com',
        rating: 4,
        description: 'Where we find everything else'
    
    },
    {
      id: 3,
      title: 'github',
      url: 'https://www.github.com',
      rating: 5,
      description: 'its github'
    }];
}

module.exports = {
    makeBookmarksArray,
}