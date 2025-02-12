//Add the campaign panel
$(function () {
	var $panel = $("<panel id='Battlepass_Panel'></panel>").css({
		visibility: "visible",
		width: "100%",
		height: "100%",
    }).attr({
		name: "Battlepass_Panel",
		src: "coui://ui/mods/battlepass/battlepass.html",
		"yield-focus": true,
//	fit: "dock-top-left",
     });
    $panel.appendTo("body");
    api.Panel.bindElement($panel[0]);
	//Delayed so the positioning works out right
	$panel.css("display", "flex");



	 $.get("coui://ui/mods/battlepass/battlepass_button.html").then(function(file){
		$("#nav-replays").after(file)
	 })
});


model.switchToBattlepass = function(){
	window.location.href = 'coui://ui/mods/battlepass/battlepass.html';
}

