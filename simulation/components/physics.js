import * as CES from 'ces'

export default CES.Component.extend({
  name: 'physics',
  init: function (body) {
    this.body = body
  }
})
