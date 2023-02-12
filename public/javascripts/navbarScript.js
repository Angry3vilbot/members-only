window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.querySelector("nav").classList.add("stretch");
  } else {
    document.querySelector("nav").classList.remove("stretch");
  }
}