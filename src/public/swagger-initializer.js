window.onload = function() {
  //<editor-fold desc="Changeable Configuration Block">

  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  window.ui = SwaggerUIBundle({
    url: "./swagger.yaml",
    dom_id: '#swagger-ui',
    deepLinking: false,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl,
      // {
      //   statePlugins: {
      //     spec: {
      //       wrapSelectors: (selector) => {
      //         return selector + ',input[data-x-display="textarea"]}'
      //       }
      //     }
      //   }
      // }
    ],
    layout: "StandaloneLayout"
  });

  //</editor-fold>
};

// document.addEventListener('DOMContentLoaded', function() {
//   setInterval(function() {
//     var inputs = document.querySelectorAll('input[placeholder="content"]')
//     inputs.forEach(function(input) {
//       var textarea = document.createElement('textarea')
//       textarea.setAttribute('x-display', 'textarea')
//       for (var i = 0; i < input.attributes.length; i++) {
//         textarea.setAttribute(input.attributes[i].name, input.attributes[i].value)
//       }
//       input.parentNode.replaceChild(textarea, input)
//     })
//   }, 1000)
  
// })
// console.log(900)
