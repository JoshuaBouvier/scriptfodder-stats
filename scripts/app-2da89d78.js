"use strict";function appendTransform(e,t){return e=angular.isArray(e)?e:[e],e.concat(t)}var app=angular.module("stats",["ngAnimate","ngCookies","ngTouch","ngResource","ngSanitize","ui.router","ui.bootstrap","ngStorage","darthwade.loading","mwl.bluebird","daterangepicker","nvd3","angularMoment","ksCurrencyConvert"]).config(["$httpProvider",function(e){e.interceptors.push(["LoadingIndicator","$q",function(e,t){return{request:function(t){return e.startedLoading(),t},requestError:function(r){return e.finishedLoading(),t.reject(r)},responseError:function(r){return e.finishedLoading(),t.reject(r)},response:function(t){return e.finishedLoading(),t}}}])}]).config(["$stateProvider","$urlRouterProvider",function(e,t){e.state("home",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl"}).state("statistics",{url:"/stats",templateUrl:"app/statistics/statistics.html",controller:"StatisticsCtrl","abstract":!0,resolve:{scripts:["ScriptFodder","$state",function(e,t){return e.initialize().then(function(){return e.Scripts.query().$promise}).map(function(e){return e.$info()}).map(function(t){return e.Scripts.purchases({scriptId:t.id}).$promise.then(function(e){return t.purchases=e,t})["catch"](console.log.bind(console))})["catch"](function(){t.go("home")})}]}}).state("statistics.dashboard",{url:"",templateUrl:"app/statistics/dashboard.html",controller:"DashboardCtrl"}).state("statistics.related",{url:"/related",templateUrl:"app/statistics/purchaseinfo.html",controller:"PurchaseInfoCtrl"}).state("statistics.revenue",{url:"/revenue",templateUrl:"app/statistics/revenue.html",controller:"RevenueCtrl"}).state("statistics.alltime",{url:"/alltime",templateUrl:"app/statistics/alltime.html",controller:"AlltimeCtrl"}).state("statistics.monthly",{url:"/monthly",templateUrl:"app/statistics/monthly.html",controller:"MonthlyCtrl"}).state("about",{url:"/about",templateUrl:"app/about/about.html"}),t.otherwise("/")}]).run(["$localStorage",function(e){e.globalCurrency=e.globalCurrency||"USD"}]);angular.module("stats").controller("NavbarCtrl",["$scope","ScriptFodder","LoadingIndicator","$rootScope",function(e,t,r){e.ScriptFodder=t,e.loadingIndicator=r}]),angular.module("stats").controller("StatisticsCtrl",["$scope","$localStorage",function(e,t){e.$storage=t}]),angular.module("stats").controller("RevenueCtrl",["$scope","$loading","ScriptFodder","$q","scripts",function(e,t,r,a,n){function s(t,r){for(var a=[],n=[],s=0;s<t.length;s++){var i=t[s].purchases;a[s]=_.chain(i).filter(function(t){return moment(1e3*t.purchase_time).isBetween(e.dateRange.startDate,e.dateRange.endDate)}).groupBy(function(e){var t=new Date(1e3*e.purchase_time);return t.setSeconds(0),t.setMinutes(0),t.setHours(12),t.valueOf()}).reduce(function(e,t,a){if("revenue"==r){var n=_.chain(t).pluck("price").reduce(_.add).value();e[a]=n}else"purchases"==r&&(e[a]=t.length);return e},{}).tap(function(e){for(var t=moment(1*_(e).keys().min()),r=moment(1*_(e).keys().max()),a=t,n=0;a.add(1,"d"),e[1e3*a.unix()]=e[1e3*a.unix()]||0,a.isBefore(r);n++);console.log("Finished")}).map(function(e,t){var r=new Date(1*t);return{date:r,value:e}}).sortBy(function(e){return e.date}).value(),n[s]=t[s].name}return{data:a,labels:n}}t.start("data"),e.dateRange={},e.checkModel={0:!0},e.scripts=n;var i=_.chain(e.scripts).pluck("addedDate").min().value();e.dateRange={startDate:new Date(1e3*i),endDate:Date.now()},e.maxDate=Date.now(),e.$watch(function(){return[e.checkModel,e.dateRange]},function(){var t=_.filter(e.scripts,function(t,r){return e.checkModel[r]});if(!(t.length<1)){var r=s(t,"purchases");MG.data_graphic({title:"Number of Purchases",data:r.data,legend:r.labels,legend_target:".legend",target:"#number",full_width:!0,interpolate:"basic",height:200,right:40,linked:!0,y_label:"Amount"});for(var a=s(t,"revenue"),n=[],i=0;i<a.data.length;i++){var o=_(a.data[i]).indexBy("date").value();_.merge(n,o,n,function(e,t){return e&&t?{date:e.date,value:e.value+t.value}:e&&!t?e:!e&&t?t:void 0})}var c=_(n).values().sortBy(function(e){return e.date}).value();MG.data_graphic({title:"Revenue",data:c,yax_units:"$",target:"#revenue",full_width:!0,interpolate:"basic",y_label:"Revenue in $",height:200,right:40,linked:!0})}},!0)}]),angular.module("stats").controller("MonthlyCtrl",["$scope","scripts",function(e,t){function r(e){var r=_(t).mapValues(function(t){var r=_(t.purchases).filter(function(e){return e.price>0}).groupBy(function(t){return moment(1e3*t.purchase_time).startOf(e).unix()}).tap(function(e){for(var t=moment(n);!t.isAfter(s);t.add(1,"M"))e[t.unix()]=e[t.unix()]||[]}).pairs().sortBy(function(e){return moment(1e3*e[0]).unix()}).mapValues(function(e){var t=e[1];return{time:e[0],purchases:t,scriptsSold:t.length,revenue:_(t).pluck("price").reduce(_.add)||0}}).value();return r}).value();return r}function a(e){return _(t).map(function(t,r){return{id:r,key:t.name,values:_(i[r]).mapValues(function(t){return{x:t.time,y:t[e]}}).toArray().value()}}).value()}e.scripts=t;var n=_.chain(t).map(function(e){return _(e.purchases).filter(function(e){return 0!=e.price}).pluck("purchase_time").min()}).min().value(),s=_.chain(t).map(function(e){return _(e.purchases).pluck("purchase_time").max()}).max().value();n=moment(1e3*n).startOf("month"),s=moment(1e3*s).startOf("month");var i=r("month");console.log("Got Monthly",i),e.revenue=a("revenue"),e.numPurchases=a("scriptsSold");var o={type:"multiBarChart",height:450,margin:{top:20,right:20,bottom:60,left:45},clipEdge:!0,staggerLabels:!0,transitionDuration:500,stacked:!0,xAxis:{axisLabel:"Date",showMaxMin:!1,tickFormat:function(e){return moment(1e3*e).format("MM/YY")}}};e.revenueChart={chart:_.extend({yAxis:{axisLabel:"Revenue",axisLabelDistance:40,tickFormat:function(e){return d3.format("$,.1f")(e)}}},o)},e.numPurchasesChart={chart:_.extend({yAxis:{axisLabel:"Revenue",axisLabelDistance:40,tickFormat:function(e){return e}}},o)}}]),angular.module("stats").controller("DashboardCtrl",["$scope","scripts",function(e,t){function r(e,t,r){var a={};return a.revenue=_.chain(r.purchases).filter(function(r){return moment(1e3*r.purchase_time).isBetween(e,t)}).tap(function(e){a.amountSold=e.length}).pluck("price").reduce(_.add).value(),a}function a(e,t){return _.chain(e).pluck(t).reduce(_.add).value()}function n(e){return{revenue:a(e.scripts,"revenue"),amountSold:a(e.scripts,"amountSold")}}e.scripts=t,e.performance={lastMonth:{scripts:[],total:{}},thisMonth:{scripts:[],total:{}}};for(var s=0;s<t.length;s++)e.performance.lastMonth.scripts[s]=r(moment().subtract(1,"M").startOf("month"),moment().subtract(1,"M").endOf("month"),t[s]),e.performance.lastMonth.scripts[s].script=e.scripts[s],e.performance.lastMonth.date=moment().subtract(1,"M").startOf("month"),e.performance.thisMonth.scripts[s]=r(moment().startOf("month"),moment(),t[s]),e.performance.thisMonth.scripts[s].script=e.scripts[s];e.performance.lastMonth.total=n(e.performance.lastMonth),e.performance.thisMonth.total=n(e.performance.thisMonth),e.salesGraphData=e.performance.thisMonth.scripts,e.salesGraphOptions={chart:{type:"pieChart",height:300,margin:{top:10,right:10,bottom:10,left:10},showLegend:!1,x:function(e){return e.script.name},y:function(e){return e.revenue||0},showValues:!1,valueFormat:function(e){return d3.format("$,.2f")(e)},duration:4e3}}}]),angular.module("stats").controller("AlltimeCtrl",["$scope","scripts",function(e,t){function r(e,t,r){var a={};return a.revenue=_.chain(r.purchases).filter(function(r){return moment(1e3*r.purchase_time).isBetween(e,t)}).tap(function(e){a.amountSold=e.length}).pluck("price").reduce(_.add).value(),a}function a(e,t){return _.chain(e).pluck(t).reduce(_.add).value()}function n(e){return{revenue:a(e.scripts,"revenue"),amountSold:a(e.scripts,"amountSold")}}function s(e){var r=_(t).pluck("purchases").flatten().groupBy(function(t){return moment(1e3*t.purchase_time).startOf(e)}).mapValues(function(e){return{purchases:e,scriptsSold:e.length,revenue:_(e).pluck("price").reduce(_.add)}}).pairs().sortBy(function(e){return moment(e[0]).unix()}).map(function(e){return e[1].time=e[0],e[1]}).value();return r}function i(e){var t=_(e).pluck("revenue").max();return console.log(t),_.find(e,{revenue:t})}e.scripts=t,e.performance={overall:{scripts:[],total:0},records:{}};for(var o=0;o<t.length;o++)e.performance.overall.scripts[o]=r(moment(0),moment(),t[o]),e.performance.overall.scripts[o].script=e.scripts[o];e.performance.overall.total=n(e.performance.overall);var c=_.chain(t).map(function(e){return _(e.purchases).pluck("purchase_time").min()}).min().value();c=moment(1e3*c),_.forEach(["day","week","month"],function(t){e.performance[t]=s(t),e.performance.records[t]=i(e.performance[t])}),console.log(e.performance)}]).directive("salesRecord",function(){return{restrict:"E",templateUrl:"app/statistics/alltime_sales-record.html",scope:{interval:"=",intervalName:"@",dateFormat:"@",globalCurrency:"="}}}),angular.module("stats").config(["$httpProvider",function(e){e.defaults.useXDomain=!0}]).factory("ScriptFodder",["$resource","$localStorage","$http","$q",function(e,t,r,a){var n={},s=function(){n.Scripts=e("https://scriptfodder.com/api/scripts/info/:scriptId?api_key="+t.apiKey,{scriptId:"@id"},{query:{method:"GET",url:"https://scriptfodder.com/api/scripts?api_key="+t.apiKey,isArray:!0,transformResponse:appendTransform(r.defaults.transformResponse,function(e){return e.scripts})},info:{method:"GET",transformResponse:appendTransform(r.defaults.transformResponse,function(e){return e.script})},purchases:{method:"GET",url:"https://scriptfodder.com/api/scripts/purchases/:scriptId?api_key="+t.apiKey,isArray:!0,transformResponse:appendTransform(r.defaults.transformResponse,function(e){return e.purchases=_(e.purchases).mapValues(function(e){return e.price=e.price&&parseFloat(e.price)||0,e}).toArray().value(),e.purchases})}})};return n.ready=!1,n.initialize=function(){return this.ready&&a.resolve(),this.initializing=!0,s(),this.Scripts.query().$promise.then(function(){n.ready=!0})},n.getOftenPurchasedWith=function(e){var t=this;return a.resolve().then(function(){return t.frequentSets||(t.frequentSets=r.get("/assets/frequentSets.json").then(function(e){return e.data})),t.frequentSets}).then(function(t){var r=_.find(t,function(t){return t.KeyItem==e});return r?_.filter(r.ItemSet,function(t){return t!=e}):null})},n.getLocalScriptInfo=function(e){var t=this,n={};return n.$promise=a.resolve().then(function(){return t.scriptInfo||(t.scriptInfo=r.get("/assets/scripts.json").then(function(e){return e.data})),t.scriptInfo}).then(function(t){return _.find(t,function(t){return t.id==e})}).then(function(t){return t?(_.extend(n,t),n):a.reject("Script "+e+" could not be found in the local db")}),n},n.isReady=function(){return this.ready},n}]),angular.module("ksCurrencyConvert",[]).factory("ExchangeRate",["$http",function(e){var t={},r=["AUD","BGN","BRL","CAD","CHF","CNY","CZK","DKK","GBP","HKD","HRK","HUF","IDR","ILS","INR","JPY","KRW","MXN","MYR","NOK","NZD","PHP","PLN","RON","RUB","SEK","SGD","THB","TRY","USD","ZAR"];return t.getSupportedCurrencies=function(){return r},t.isCurrencySupported=function(e){return-1!==_.findKey(r,e)},t.getExchangeRate=function(t,r,a,n){if(!this.isCurrencySupported(t))throw new Error("Invalid base currency");if(!this.isCurrencySupported(r))throw new Error("Invalid toCurrency");var s=angular.isArray(r);s||(r=[r]);var i;return i=angular.isDefined(a)?"https://api.fixer.io/"+moment(a).format("YYYY-MM-DD"):"https://api.fixer.io/latest",e({url:i,method:"GET",params:{base:t,symbols:r.join(",")}}).then(function(e){return console.log(e),200!=e.status?n.reject(["Error fetching data ",e]):s?e.data:{rate:e.data.rates[r],date:e.data.date}})["catch"](console.log.bind(console))},t}]).directive("alternativeCurrency",["ExchangeRate","currencySymbolMap",function(e,t){return{templateUrl:"app/services/alternative-currency.html",restrict:"E",scope:{toCurrency:"=",baseCurrency:"=",date:"=",amount:"="},controller:["$scope",function(r){r.currencySymbol=t[r.toCurrency],r.isLoading=!0,r.hideConverted=r.hideConverted||r.baseCurrency==r.toCurrency,e.getExchangeRate(r.baseCurrency,r.toCurrency,r.date).then(function(e){r.rate=e.rate,console.log(r.amount,e),r.convertedAmount=r.amount*e.rate,r.rateFrom=e.date})["catch"](function(e){console.log(e),r.isError=!0})["finally"](function(){r.isLoading=!1})}]}}]).constant("currencySymbolMap",{ALL:"L",AFN:"؋",ARS:"$",AWG:"ƒ",AUD:"$",AZN:"₼",BSD:"$",BBD:"$",BYR:"p.",BZD:"BZ$",BMD:"$",BOB:"Bs.",BAM:"KM",BWP:"P",BGN:"лв",BRL:"R$",BND:"$",KHR:"៛",CAD:"$",KYD:"$",CLP:"$",CNY:"¥",COP:"$",CRC:"₡",HRK:"kn",CUP:"₱",CZK:"Kč",DKK:"kr",DOP:"RD$",XCD:"$",EGP:"£",SVC:"$",EEK:"kr",EUR:"€",FKP:"£",FJD:"$",GHC:"¢",GIP:"£",GTQ:"Q",GGP:"£",GYD:"$",HNL:"L",HKD:"$",HUF:"Ft",ISK:"kr",INR:"₹",IDR:"Rp",IRR:"﷼",IMP:"£",ILS:"₪",JMD:"J$",JPY:"¥",JEP:"£",KES:"KSh",KZT:"лв",KPW:"₩",KRW:"₩",KGS:"лв",LAK:"₭",LVL:"Ls",LBP:"£",LRD:"$",LTL:"Lt",MKD:"ден",MYR:"RM",MUR:"₨",MXN:"$",MNT:"₮",MZN:"MT",NAD:"$",NPR:"₨",ANG:"ƒ",NZD:"$",NIO:"C$",NGN:"₦",NOK:"kr",OMR:"﷼",PKR:"₨",PAB:"B/.",PYG:"Gs",PEN:"S/.",PHP:"₱",PLN:"zł",QAR:"﷼",RON:"lei",RUB:"₽",SHP:"£",SAR:"﷼",RSD:"Дин.",SCR:"₨",SGD:"$",SBD:"$",SOS:"S",ZAR:"R",LKR:"₨",SEK:"kr",CHF:"Fr.",SRD:"$",SYP:"£",TZS:"TSh",TWD:"NT$",THB:"฿",TTD:"TT$",TRY:"",TRL:"₤",TVD:"$",UGX:"USh",UAH:"₴",GBP:"£",USD:"$",UYU:"$U",UZS:"лв",VEF:"Bs",VND:"₫",YER:"﷼",ZWD:"Z$"}),angular.module("stats").service("LoadingIndicator",[function(){this.loadingStack=new Array,this.isLoading=function(){return this.loadingStack.length>0},this.startedLoading=function(){this.loadingStack.push(!0)},this.finishedLoading=function(){this.loadingStack.pop()}}]),angular.module("stats").controller("MainCtrl",["$scope","$localStorage","$loading","ScriptFodder","$rootScope",function(e,t,r,a){e.$storage=t,e.performCheck=function(){r.start("checkApiKey"),e.checkResult={},a.initialize().then(function(){r.finish("checkApiKey"),e.checkResult={status:"success"}},function(t){r.finish("checkApiKey"),e.checkResult={status:"error",error:t}})},e.$storage.apiKey&&e.performCheck()}]),angular.module("stats").run(["$templateCache",function(e){e.put("app/about/about.html",'<div class="row content"><div class="col-md-6 col-md-offset-3 text-center"><h1>StatFodder</h1><p>Created by Kamshak. Free and open-source.</p></div></div>'),e.put("app/main/main.html",'<div class="container"><div class="row content"><div class="col-md-6 col-md-offset-3 text-center"><h1>Welcome to StatFodder</h1><p>This site can be used by scriptfodder developers to get an overview of their sales statistics. To get started enter your API key below. The site runs on javascript, your key is only saved locally and never transmitted to a server.</p><p>You can set a currency that some amounts will be converted into.</p><div class="panel panel-primary"><div class="panel-heading"><h4 class="panel-title">API Settings</h4></div><div class="panel-body" dw-loading="checkApiKey"><div ng-show="checkResult.status" class="col-md-12" style="margin-top: 15px"><div class="alert alert-success" role="alert" ng-show="checkResult.status == \'success\'"><strong>Success</strong> The api key entered is valid. You can now access the Statistics tab.</div><div class="alert alert-danger" role="alert" ng-show="checkResult.status == \'error\'"><strong>Error</strong> The api key was not valid or the SF API is down.</div></div><div class="col-md-12"><form class="form-horizontal"><div class="form-group"><label for="apiKey">API Key</label> <input type="text" class="form-control" id="apiKey" placeholder="" ng-model="$storage.apiKey"> <button type="submit" class="btn btn-default" ng-click="performCheck()" style="margin-top: 5px">Check</button></div><div class="form-group"><label for="currency">Currency</label><select id="currency" class="form-control" ng-model="$storage.globalCurrency"><option>GBP</option><option>EUR</option><option>USD</option></select></div></form></div></div></div></div></div></div>'),e.put("app/services/alternative-currency.html",'<span><span>{{amount | currency}}</span> <span ng-hide="hideConverted">| <span ng-show="isLoading"><i class="fa fa-spinner fa-pulse"></i>loading...</span> <abbr tooltip="Exchange rate {{rate}} from {{rateFrom | amCalendar}}" tooltip-placement="bottom" ng-show="!isLoading">{{scope.isError && "error"}}{{convertedAmount | currency:currencySymbol}}</abbr></span></span>'),e.put("app/statistics/alltime.html",'<h1>All-time Script Statistics</h1><div class="row"><div class="col-md-12"><div class="panel panel-default"><div class="panel-heading">Total Revenue</div><div class="panel-body"><p><strong>Scripts Sold</strong>: {{performance.overall.total.amountSold}}</p><p><strong>Revenue</strong>:<alternative-currency to-currency="$storage.globalCurrency" base-currency="\'USD\'" amount="performance.overall.total.revenue"></alternative-currency></p><div class="row"><div class="col-md-12"><nvd3 options="salesGraphOptions" data="performance.scripts"></nvd3></div></div></div></div></div></div><div class="row"><div class="col-md-4"><sales-record interval="performance.records.day" interval-name="Day" date-format="dddd, MMMM Do YYYY" global-currency="$storage.globalCurrency"></sales-record></div><div class="col-md-4"><sales-record interval="performance.records.week" interval-name="Week" date-format="[Week] W of YYYY (MMMM Do YYYY [+ 7 Days])" global-currency="$storage.globalCurrency"></sales-record></div><div class="col-md-4"><sales-record interval="performance.records.month" interval-name="Month" date-format="MMMM YYYY" global-currency="$storage.globalCurrency"></sales-record></div></div>'),e.put("app/statistics/alltime_sales-record.html",'<div class="panel panel-default"><div class="panel-heading"><h4>Best {{intervalName}}</h4><h6>{{ interval.time | amDateFormat:dateFormat }}</h6></div><div class="panel-body"><p><strong>Revenue</strong>:<alternative-currency to-currency="globalCurrency" date="interval.time" base-currency="\'USD\'" amount="interval.revenue"></alternative-currency></p><p><strong>Scripts Sold</strong>: {{ interval.scriptsSold }}</p></div></div>'),e.put("app/statistics/dashboard.html",'<h1>Dashboard</h1><div class="row"><div class="col-md-6"><div class="panel panel-default"><div class="panel-heading">This Month</div><div class="panel-body"><p><strong>Scripts Sold</strong>: {{performance.thisMonth.total.amountSold}}</p><p><strong>Revenue</strong>:<alternative-currency to-currency="$storage.globalCurrency" base-currency="\'USD\'" amount="performance.thisMonth.total.revenue"></alternative-currency></p><div class="row"><div class="col-md-12"><nvd3 options="salesGraphOptions" data="performance.thisMonth.scripts"></nvd3></div></div></div></div></div><div class="col-md-6"><div class="panel panel-default"><div class="panel-heading">Last Month</div><div class="panel-body"><p><strong>Scripts Sold</strong>: {{performance.lastMonth.total.amountSold}}</p><p><strong>Revenue</strong>:<alternative-currency to-currency="$storage.globalCurrency" date="performance.lastMonth.date" base-currency="\'USD\'" amount="performance.lastMonth.total.revenue"></alternative-currency></p><div class="row"><div class="col-md-12"><nvd3 options="salesGraphOptions" data="performance.lastMonth.scripts"></nvd3></div></div></div></div></div></div>'),e.put("app/statistics/monthly.html",'<div class="row"><div class="col-md-12"><h1>Sales Distribution</h1><h2>By Revenue</h2><nvd3 options="revenueChart" data="revenue"></nvd3><h2>By number of purchases</h2><nvd3 options="numPurchasesChart" data="numPurchases"></nvd3></div></div>'),e.put("app/statistics/revenue.html",'<h1>Daily Statistics</h1><h2>Scripts</h2><div class="btn-group"><label ng-repeat="script in scripts" class="btn btn-primary" ng-model="checkModel[$index]" btn-checkbox="">{{script.name}}</label></div><h2>Timespan</h2><input date-range-picker="" class="form-control date-picker" type="text" min="minDate" max="maxDate" ng-model="dateRange"><div id="revenue"></div><div id="number"></div><div class="legend"></div>'),e.put("app/statistics/statistics.html",'<div class="col-md-3" role="complementary"><nav class="bs-docs-sidebar hidden-print hidden-xs hidden-sm"><ul class="nav bs-docs-sidenav"><li ui-sref-active="active"><a ui-sref="statistics.dashboard">Dashboard</a></li><li ui-sref-active="active"><a ui-sref="statistics.revenue">Daily Revenue Analyzer</a></li><li ui-sref-active="active"><a ui-sref="statistics.monthly">Sales Distribution / Monthly stats</a></li><li ui-sref-active="active"><a ui-sref="statistics.alltime">All Time Stats / Records</a></li></ul></nav></div><div class="col-md-9" ui-view=""></div>'),e.put("app/components/navbar/navbar.html",'<nav class="navbar navbar-static-top navbar-default" ng-controller="NavbarCtrl"><div class="container"><div class="navbar-header"><a class="navbar-brand" href="https://sfstats.kamshak.com/"><span class="fa fa-line-chart"></span> StatFodder</a><div class="navbar-brand has-spinner" ng-show="loadingIndicator.isLoading()"><i class="spinner fa fa-spinner fa-1x fa-spin"></i></div></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-6"><ul class="nav navbar-nav"><li ui-sref-active="active"><a ui-sref="home">Home</a></li><li ui-sref-active="active" ui-sref="statistics" ng-show="ScriptFodder.isReady()"><a ui-sref="statistics.dashboard">Statistics</a></li><li ui-sref-active="active"><a ui-sref="about">About</a></li></ul><ul class="nav navbar-nav navbar-right"><li><a href="https://github.com/Kamshak/scriptfodder-stats"><span class="fa fa-github"></span> scriptfodder-stats</a></li></ul></div></div></nav>')}]);