(function ($) {
   $(document).ready(function() {

      let $menu = $('.menu__list');
      let $item = $('.menu__item');
      let w = $(window).width(); //window width
      let h = $(window).height(); //window height

      if (window.matchMedia("(min-width: 768px)").matches) {

         $(window).on('mousemove', function(e) {
            let offsetX = 0.5 - e.pageX / w; //cursor position X
            let offsetY = 0.5 - e.pageY / h; //cursor position Y
            let dy = e.pageY - h / 2; //@h/2 = center of poster
            let dx = e.pageX - w / 2; //@w/2 = center of poster
            let theta = Math.atan2(dy, dx); //angle between cursor and center of poster in RAD
            let angle = theta * 180 / Math.PI - 90; //convert rad in degrees
            let offsetPoster = $menu.data('offset');
            let transformPoster = 'translate3d(0, ' + -offsetX * offsetPoster + 'px, 0) rotateX(' + (-offsetY * offsetPoster) + 'deg) rotateY(' + (offsetX * (offsetPoster * 2)) + 'deg)'; //poster transform

            //get angle between 0-360
            if (angle < 0) {
               angle = angle + 360;
            }

            //poster transform
            $menu.css('transform', transformPoster);

            //parallax for each layer
            $item.each(function() {
               let $this = $(this);
               let offsetLayer = $this.data('offset') || 0;
               let transformLayer = 'translate3d(' + offsetX * offsetLayer + 'px, ' + offsetY * offsetLayer + 'px, 20px)';
               $this.css('transform', transformLayer);
            });
         });
      }

      let returnLink = $('.return__link');

      $item.click(function() {
         $menu.hide();
         returnLink.slideToggle(300);
         let sectionName = $(this).data('name');
         $(`section.${sectionName}`).slideToggle(800).addClass('active');
      });

      returnLink.click(function() {
         $(`section.active`).hide();
         $menu.slideToggle(300);
         returnLink.slideToggle(300);
      });

      function calculate_age(dob) {
         var diff_ms = Date.now() - dob.getTime();
         var age_dt = new Date(diff_ms);
         return Math.abs(age_dt.getUTCFullYear() - 1970);
      }

      let myAge = calculate_age(new Date(1996, 2, 4));
      $('#age').text(myAge);
   });
})(jQuery);
