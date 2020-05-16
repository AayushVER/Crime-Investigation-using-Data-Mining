// $(".form-check-input").click( function(){
//     if($(this).attr("value")==="caseId"){
//       $(".search-bar").attr("placeholder", "Find case by Case ID");
//     }else if($(this).attr("value")==="caseTitle"){
//       $(".search-bar").attr("placeholder", "Find case by Case Title");
//     }
// })


$(".form-check-input").click( function(){
  let value = $(this).attr("id");
  let msg = "Find case by "+value;
  $(".filter-search-bar").attr("placeholder", msg);
});
