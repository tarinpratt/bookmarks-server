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

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    url: 'https://www.hackers.com',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 1,
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}

module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark,
}