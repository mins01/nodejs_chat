Vue.component('autolink', {
  props: ['content'],
  template: '<span>{{ content }}</span>',
  mounted: function() {
    $(this.$el).autolink();
  }
});