/* global app */

/**
 * Email Resource
 */

app.service('Email', ['$resource', function ($resource) {
  return $resource('email/:id', { id: '' }, {
    update: {
      method: 'PUT',
      params: {}
    }
  })
}])

app.service('FavIcon', [function () {
  var scheme = new ColorScheme;
  const assignedPalette = scheme.from_hue(21)
    .scheme('tetrade')
    .variation('pastel')
    .colors()
    .map((color)=>{return {
      color: color,
      addresses: []
    }})
    .splice(0,3);

  const getInitials = (emailAddress)=>emailAddress
    .replaceAll(/[-\.]/g,' ')
    .replace(/[^a-zA-Z- ]/g, "")
    .match(/\b\w/g)
    .splice(0,2)
    .join('')
    .toUpperCase();

  let lastAssigned=-1;
  const assignColor = (address) => {
    for (let i = 0; i < assignedPalette.length; i++) {
      if (assignedPalette[i].addresses.indexOf(address) !== -1) {
        return assignedPalette[i].color;
      }
    }
    lastAssigned = (lastAssigned + 1) % assignedPalette.length
    assignedPalette[lastAssigned].addresses.push(address)
    return assignedPalette[lastAssigned].color;
  }
  /*console.log([
  assignColor('a1.t@email.com'),
  assignColor('a2.t@email.com'),
  assignColor('a3.t@email.com'),
  assignColor('a2.t@email.com'),
  assignColor('b1.t@email.com'),
  assignColor('b2.t@email.com')
  ]);
  */
  return {
    extract : (mailObjects) => {
      return mailObjects.map((mailObject) => {
        mailObject.favicon = {
          type: 'badge',
          text: getInitials(mailObject.envelope.from.address),
          color: '#' + assignColor(mailObject.envelope.from.address)
        }
        if (!mailObject.html) return mailObject
        const tagMatches = mailObject.html.match(/<link (.*?rel="shortcut icon".*?)>.*<\/head>/i)
        if (tagMatches) {
          const hrefMatch = tagMatches[1].match(/href="(.*?)"/)
          if (hrefMatch) {
            mailObject.favicon = {
              type: 'image',
              src: hrefMatch[1]
            }
          }
        }
        return mailObject
      })
    }


  }
}])
