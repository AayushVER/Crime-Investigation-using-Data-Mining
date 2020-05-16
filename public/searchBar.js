$(".form-check-input").click( function(){
  let value = $(this).attr("id");
  let msg = "Find case by "+value;
  if(value==="Case ID"||value==="Case Title"){
      $(".search-bar").attr("placeholder", msg);
  } else {
      $(".filter-search-bar").attr("placeholder", msg);
  }
});
