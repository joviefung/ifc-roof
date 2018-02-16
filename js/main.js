import html2canvas from 'html2canvas';

const convertImage = () => {
  // get the background image first
  $(".text-row").hide();
  html2canvas($(".image-container").get(0)).then((canvas) => {
    // hide the background image, change to blue background to make it easier for transparency post-processing
    $(".image-container").removeClass("show");
    // restore text
    $(".text-row").show();

    html2canvas($(".image-container").get(0)).then((textCanvas) => {
      // restore background image
      $(".image-container").addClass("show");

      // resize the text to smaller size to alias the font
      const smallCanvas = document.createElement('canvas');
      const context = smallCanvas.getContext("2d");
      smallCanvas.width = textCanvas.width / 2;
      smallCanvas.height = textCanvas.height / 2;
      context.drawImage(textCanvas, 0, 0, textCanvas.width, textCanvas.height, 0, 0, textCanvas.width / 2, textCanvas.height / 2);

      // remove blue background
      var image = context.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
      length = image.data.length;
      for(var i = 3; i < length; i += 4){
        if (image.data[i-1] > image.data[i-2] && image.data[i-1] > image.data[i-3]) {
          if (image.data[i-1] > 210) {
            // make background transparent
            image.data[i] = 0; 
          } else {
            // make to grey or black to increase the black border of text
            image.data[i-1] = image.data[i-3];
            image.data[i-2] = image.data[i-3];
          }
        }
      }
      context.putImageData(image, 0, 0);
      
      // merge the background image and text
      const finalCanvas = document.createElement('canvas');
      const finalContext = finalCanvas.getContext("2d");
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      finalContext.drawImage(canvas, 0, 0);
      finalContext.drawImage(smallCanvas, 0, 0, smallCanvas.width, smallCanvas.height, 0, 0, canvas.width, canvas.height);

      $(".download-link").attr("href", finalCanvas.toDataURL());
    });
  });
};

$(function() {
  $(".date-picker").datepicker({
    dateFormat: "m d",
    onSelect: (date) => {
      const arr = date.split(' ');
      $(".month").text(arr[0]);
      $(".day").text(arr[1]);
      convertImage();
    }
  });

  $(".time-picker input").timepicker({
    timeFormat: 'h:mm p',
    defaultTime: '17',
    change: (time) => {
      const hour = time.getHours();
      const minutes = time.getMinutes();
      $(".hour").text(hour > 12 ? hour-12 : hour);
      $(".minute").text(minutes < 10 ? '0'+minutes : minutes);
      convertImage();
    }
  });

  $(".location-picker input").keyup((e) => {
    const location = e.target.value;
    $(".location").text(location || "香港交易廣場天台");
    convertImage();
  })

  $(".month").text(new Date().getMonth()+1);
  $(".day").text(new Date().getDate());
  convertImage();
});
