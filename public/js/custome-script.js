  $(document).ready(function() {

      // dropdown intitilize
      $('.dropdown-button').dropdown({
          inDuration: 300,
          outDuration: 225,
          constrain_width: false, // Does not change width of dropdown to that of the activator
          // hover: true, // Activate on hover
          gutter: 0, // Spacing from edge
          belowOrigin: false, // Displays dropdown below the button
          alignment: 'right' // Displays dropdown with edge aligned to the left of button
      });

      // side nav
      $(".button-collapse").sideNav();

      // tooltipped
         $('.tooltipped').tooltip({delay: 50});

      // modal
       $('.modal-trigger').leanModal();   

       // show count is RT more then 0
       $( ".btn-retweet span:contains(0)" ).css( "display", "none" );
       $( ".btn-like span:contains(0)" ).css( "display", "none" );
       
//        // $( ".btn-like span:contains(0)" ).css( "display", "none" ).removeClass("btn-like-active");
// // $( "div:contains('John')" ).css( "text-decoration", "underline" );
// //       if ($('.btn-like span:contains("0")')) {
// //       //    if ($(this).parent().is('.btn-like')) {
// //          alert('bluvalue is 0 ');

// //       //    return $(this).parent().addClass('btn-like-active');
// //      }
// //      alert('not a 0')

// $('.btn-like').removeClass("btn-like-active")   

// if ($('.btn-like span:contains("0")')) 
//  { 

//     $('.btn-like').addClass("btn-like-active")   
//      // $(this).parent().addClass("btn-like-active");
//  }
// $('.btn-like').removeClass("btn-like-active")   

     // $(this).parent().removeClass("btn-like");


  })