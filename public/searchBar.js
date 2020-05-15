// function textTitle (){
//
//   if($(this).attr("value")==="caseId"){
//     $(".search-bar").attr("placeholder", "Find case by Case ID");
//   }else if($(this).attr("value")==="caseTitle"){
//     $(".search-bar").attr("placeholder", "Find case by Case Title");
//   }
// };

$(".form-check-input").click( function(){
    if($(this).attr("value")==="caseId"){
      $(".search-bar").attr("placeholder", "Find case by Case ID");
    }else if($(this).attr("value")==="caseTitle"){
      $(".search-bar").attr("placeholder", "Find case by Case Title");
    }
})
