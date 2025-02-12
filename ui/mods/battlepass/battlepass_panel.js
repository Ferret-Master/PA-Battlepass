var model;
var handlers = {};
var tempObservable = ko.observable(true);
$(document).ready(function () {

	function CampaignModel() {
		var self = this;
	}
	
	model = new CampaignModel();
	

	//Inject per scene mods
	if (scene_mod_list['Campaign_Menu'])
		loadMods(scene_mod_list['Campaign_Menu']);

	model.campaigns = ko.observable([]);
	
	model.selectedCampaignIndex = ko.observable(-1);

	model.loadCampaigns = function(){
		$.get("coui://ui/mods/mod.campaigns/campaigns/campaign_list.json").then(function(json){
			_.map(json.campaigns,function(infoURL){
				$.get(infoURL).then(function(campaignInfo){
					model.campaigns().push(campaignInfo)
				})
			})
		})
	}

	model.nextCampaign = function(){
		var campaignTotal = model.campaigns().length;
		switchCampaign((model.selectedCampaignIndex()+1)%campaignTotal)
	}

	model.previousCampaign = function(){
		var campaignTotal = model.campaigns().length;
		var newIndex = model.selectedCampaignIndex()-1%campaignTotal;
		if(newIndex < 0 || newIndex == -0){newIndex = campaignTotal-1}
		switchCampaign(newIndex)
	}


	model.selectedCampaignName = ko.observable("None Selected");
	model.campaignImg = ko.observable(undefined);
	model.campaignDescription = ko.observable("");

	
	

	model.missions = ko.observable([])

	loadMissions = ko.computed(function(){
		var campaign = model.campaigns()[model.selectedCampaignIndex()]
		console.log("load missions")
		console.log(campaign)
		if(campaign == undefined){return}
		if(campaign.missionsURL == undefined){model.missions([]);return}
		$.get(campaign.missionsURL).then(function(missionsJSON){
			model.missions(missionsJSON.missions)
		})

	})

	

	model.selectedCampaignIndex(1);
	switchCampaign(model.selectedCampaignIndex());

	model.selectedMission = ko.observable({});
	model.selectedMissionName = ko.observable("");
	model.selectedMissionDescription = ko.observable("");
	model.selectedMissionRewards = ko.observable("");
	model.selectedMissionDetails = ko.observable("");
	model.selectedMissionWarnings = ko.observable("");
	model.selectedMissionImage = ko.observable("");
	model.selectedMissionLore = ko.observable("");

	model.selectMission = function(index){

		
		if(index == undefined){return}
		if(model.missions().length > 0){
			model.selectedMission(model.missions()[index])
			model.selectedMissionName(model.selectedMission().name)
			model.selectedMissionDescription(model.selectedMission().description)
			model.selectedMissionDetails(model.selectedMission().details)
			model.selectedMissionRewards(model.selectedMission().rewards)
			model.selectedMissionImage(model.selectedMission().img)
			model.selectedMissionWarnings(model.selectedMission().warnings)
			model.selectedMissionLore(model.selectedMission().lore)
		}
	}

	model.loadCampaigns()

		

	model.lastSceneUrl = ko.observable().extend({ session: 'last_scene_url' });

	// Filters
	model.uberNetRegions = ko.observableArray().extend({ session: 'uber_net_regions' });
	model.regionNameList = ko.computed(function() {
		var result = [{text: loc('!LOC:Any'), value: 'any'}];
		_.forEach(model.uberNetRegions(), function(region) {
			result.push({text: region.Name, value: region.Name});
		});
		return result;
	});

	model.hasUberNetRegions = ko.computed(function () { return (model.uberNetRegions().length > 0); });

	model.localServerSetting = ko.observable().extend({ setting: { 'group': 'server', 'key': 'local' } });
	model.localServerDisabledInSettings = ko.pureComputed(function () {
		return model.localServerSetting() === 'OFF';
	});

	model.remoteServerAvailable = ko.computed(function() {
		return model.hasUberNetRegions();
	});

	model.disableServerOption = ko.pureComputed(function () {
		return !model.remoteServerAvailable() || model.localServerDisabledInSettings();
	});

	model.navigateToConnectToGame = function(params)
	{
		model.lastSceneUrl('coui://ui/main/game/server_browser/server_browser.html');

		var query = '';
		if (_.isObject(params))
			query = $.param(params);
		if (!_.isEmpty(query))
			query = '?' + query;
		window.location.href = 'coui://ui/main/game/connect_to_game/connect_to_game.html' + query;
	};

	model.createRemoteGame = function () {
		if (!model.remoteServerAvailable())
			return;

		model.navigateToConnectToGame({ action: 'start', content: api.content.activeContent() });
	};

	model.createLocalGame = function() {
		if (!model.useLocalServer())
			return;

		model.navigateToConnectToGame({ action: 'start', local: true, content: api.content.activeContent() });
	};

	// By default this setting is ON. If the user disabled local servers on the settings, turn it off.
	var localStorageCreateGame = localStorage.getItem('server_browser_create_local_game');
	if (localStorageCreateGame == null)
		localStorageCreateGame = true.toString();
		
	model.doCreateLocalGame = ko.observable(localStorageCreateGame === 'true');
	if (model.localServerSetting() === 'OFF')
		model.doCreateLocalGame(false);
	else if (!model.remoteServerAvailable())
		model.doCreateLocalGame(true);

	model.doCreateLocalGame.subscribe(function (value) {
		localStorage.setItem('server_browser_create_local_game', value.toString());
	});

	model.canCreateGame = ko.computed(function () {
		return model.remoteServerAvailable() || model.useLocalServer();
	});

	model.createGame = function () {
		if (model.doCreateLocalGame())
			model.createLocalGame();
		else
			model.createRemoteGame();
	};
	

	//Setup send/recv messages and signals
	app.registerWithCoherent(model, handlers);

	//Activates knockout.js
	ko.applyBindings(model);
});



function back(){
    window.location.href = 'coui://ui/main/game/start/start.html';
}

switchCampaign = function(index){
	model.selectedCampaignIndex(index)
	if(model.campaigns() !== undefined){
		if(model.campaigns().length > 0){
		model.selectedCampaignName(model.campaigns()[model.selectedCampaignIndex()].name)
		model.campaignImg(model.campaigns()[model.selectedCampaignIndex()].img)
		model.campaignDescription(model.campaigns()[model.selectedCampaignIndex()].description)
		}
		else{
		_.delay(switchCampaign,100,index)
		}
	}
}

