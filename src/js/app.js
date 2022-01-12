/* Vehicle Acceleration */

"use strict";function binaryFindIndex(e,r){if(1===e.length&&e[0]===r)return 0;for(var n=0,t=e.length-1;n<t;){var a=Math.floor((n+t)/2),o=e[a],i=e[a+1];if(r<o)t=a;else{if(!(i<r))return a+(r-o)/(i-o);n=a+1}}return-1}function interpolate(e,r,n){switch(n){case"nearest":return e[Math.round(r)];case"next":return e[Math.ceil(r)];case"previous":return e[Math.floor(r)];case"linear":default:var t=Math.floor(r),a=Math.ceil(r),o=r-t;return(1-o)*e[t]+o*e[a]}}function interp1(e,n,r,t){if(void 0===t&&(t="linear"),e.length!==n.length)throw new Error("Arrays of sample points xs and corresponding values vs have to have\n      equal length.");var a=e.map(function(e,r){return[e,n[r]]});a.sort(function(e,r){r=e[0]-r[0];if(0==r)throw new Error("Two sample points have equal value "+e[0]+". This is not allowed.");return r});for(var o=[],i=[],u=0;u<a.length;u++){var l=a[u];o.push(l[0]),i.push(l[1])}return r.map(function(e){var r=binaryFindIndex(o,e);if(-1===r)throw new Error("Query value "+e+" lies outside of range. Extrapolation is not\n        supported.");return interpolate(i,r,t)}).slice()}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=interp1;

var Highcharts = require('highcharts');
var simButton = document.querySelector('.sim-button');
var resetButton = document.querySelector('.res-button');
var chartType = document.getElementsByName('chartType')[0];

var defaultValues = ['1995', '0.33', '0.3', '2.84', '0.011', '0.65', '1.1', '4.48,2.87,1.84,1.41,1,0.74', '3.39', '0.9', '1000,2020,2990,3500,5000,6500', '306,385,439,450,450,367', '60'];
var dataVehicle = ['mass','rk','cd','al','rlc','ralc','wfc','gears','fd','kpd','rpm','tq','time'];
var chartTitle = [
    'Characteristic curves of torque and performance (full load)',
    'Engine Speed',
    'Engine Torque',
    'Engine Power',
    'Wheel Torque',
    'Vehicle acceleration',
    'Vehicle speed',
    'Engaged gear',
    'Dynamic factor of a vehicle',
    /*'Fuel consumption'  */ 
];
var timeText = 'Time, s';
var axisTitle = [
    ['Engine speed, rpm','Engine torque, Nm','','Engine power, kW'],
    [timeText,'Engine speed, rpm'],
    [timeText,'Engine torque, Nm'],
    [timeText,'Engine power, kW'],
    [timeText,'Wheel torque, Nm'],
    [timeText,'Vehicle acceleration, m/s^2'],
    [timeText,'Vehicle speed, km/h'],
    [timeText,'Engaged gear'],
    ['Dynamic factor','Vehicle speed, km/h'],
    /*['F','V']*/
];

var vh = {}, t = {}, v = {};
var en = {};

resetButton.addEventListener('click', function() {
    for(var i = 0; i < dataVehicle.length; i++) {
        document.getElementsByName(dataVehicle[i])[0].value = defaultValues[i];
    }
});

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function acceleration() {
    var temp;
    var grv = 9.81;

	for(let i = 0; i < dataVehicle.length; i++) {
		temp = document.getElementsByName(dataVehicle[i])[0].value;
		vh[dataVehicle[i]] = temp.replace(/\s+/g, '');

		if(i == 7 || i == 10 || i == 11) {
			vh[dataVehicle[i]] = vh[dataVehicle[i]].split(",");
			for (let j = 0; j < vh[dataVehicle[i]].length; j++) {
				vh[dataVehicle[i]][j] = parseFloat(vh[dataVehicle[i]][j]);
			}
		}
		else if (i == 10) {continue}
		else {
			vh[dataVehicle[i]] = parseFloat(vh[dataVehicle[i]]);
		}

	}
	
	t.gmax = vh.gears.length;
    /*if(vh.fuel = 'gas') {en.ro = 750;}
    else {en.ro = 840;}*/

    en.gp = 240;
	en.nmin = Math.min.apply(null, vh.rpm);
	en.nmax = Math.max.apply(null, vh.rpm);

	en.pwr = [];
	for (let i = 0; i < vh.rpm.length; i++) {
		en.pwr[i] = (vh.tq[i] * (vh.rpm[i] * (Math.PI/30)))/1000;
	}

	en.nInt = [];
	var tempStep = (en.nmax - en.nmin) / 20;

	for(let i = 0; i <= tempStep; i++) {
		en.nInt[i] = en.nmin + i*20;
	}
    
    
	en.tqInt = interp1(vh.rpm,vh.tq,en.nInt);
	en.pwrInt = interp1(vh.rpm,en.pwr,en.nInt);

    en.Mmax = Math.max.apply(null, vh.tq);
    en.Pmax = Math.max.apply(null, en.pwr);

    en.np = vh.rpm[en.pwr.findIndex(i => i == en.Pmax)];

    var vls = [], f = [], d = [], pTr = [], pW = [], pF = [], p = [], n = [], e = [], kN = [], kE = [], ge = [], fuel = [];

    for(let i = 0; i < t.gmax; i++) {
        vls[i] = [], f[i] = [], d[i] = [], pTr[i] = [], pW[i] = [], pF[i] = [], p[i] = [], n[i] = [], e[i] = [], kN[i] = [], kE[i] = [], ge[i] = [], fuel[i] = [];
        for(let j = 0; j < en.nInt.length; j++) {

            vls[i][j] = (3.6 * ((Math.PI * en.nInt[j] * vh.rk) / (30 * vh.gears[i] * vh.fd))); 
            f[i][j] = vh.rlc * (1 + Math.pow((0.0216 * vls[i][j]/3.6), 2));
            d[i][j] = ((en.tqInt[j] * vh.gears[i] * vh.fd * vh.kpd / vh.rk - vh.cd * vh.al * Math.pow((vls[i][j]/3.6), 2)) / (vh.mass * grv));

            pTr[i][j] = en.pwrInt[j] * (1 - vh.kpd);
            pW[i][j] = (vh.cd * vh.al * Math.pow(vls[i][j]/3.6, 3)) / 1000;
            pF[i][j] = (f[i][j] * vh.mass * grv * (vls[i][j]/3.6)) / 1000;
            p[i][j] = (en.pwrInt[j] + pTr[i][j] + pW[i][j] + pF[i][j]);

            n[i][j] = p[i][j] / en.Pmax;
            e[i][j] = en.nInt[j] / en.np;
/*
            if(vh.fuel == 'gas') {
                kN[i][j] = 3.27 - 8.22*(n[i][j]) + 9.13*Math.pow(n[i][j], 2) - 3.18*Math.pow(n[i][j], 3);
            }
            else {
                kN[i][j] = 3.52 - 17.24*(n[i][j]) + 44.85*Math.pow(n[i][j], 2) - 55.28*Math.pow(n[i][j], 3) + 31.23*Math.pow(n[i][j], 4) - 6.08*Math.pow(n[i][j], 5);
            }

            kE[i][j] = 1.25 - 0.99*(e[i][j]) + 0.98*Math.pow(e[i][j], 2) - 0.24*Math.pow(e[i][j], 3);
            ge[i][j] = en.gp * kE[i][j] * kN[i][j];
            fuel[i][j] = (ge[i][j] * p[i][j]) / (en.ro * vls[i][j] * 36 * Math.pow(10, -3)); 
*/
        }
    }

    /* Acceleration */

    var step = 0.1;
    var dt = [];

    for(let i = 0; i < (vh.time/step); i++) {
        dt[i] = step*i;
    }

    var tq = [], s = [], acs = [], vel = [], nd = [], fv = [], fS = [], fR = [], fA = [], fT = [], fF = [], pwr = [], tqW = [], gear = [];
    vel[0] = 0.1;
    acs[0] = 0;
    s[0] = 0;
    tq[0] = 0;

    vh.mass = 1.05 * vh.mass;
    var nkp = 0;

    for(let i = 0; i < dt.length; i++) {

        nd[i] = (30 * vh.gears[nkp] * vh.fd * vel[i]) / (vh.rk * Math.PI);

        if(nd[i] >= en.np) {
            nkp = nkp + 1;
            nd[i-1] = en.np;
            nd[i] = en.np * ((vh.gears[nkp] * vh.fd)/(vh.gears[nkp-1] * vh.fd));
        }   acs[i] = 0;

        if(nd[i] <= en.nmin) {
            tq[i] = Math.min.apply(null, vh.tq);
        }
        else {
            var closest = en.nInt.find(numb => numb >= nd[i]);
            tq[i] = en.tqInt[en.nInt.findIndex(i => i == closest)];
        }

        fv[i] = vh.rlc * (1 + Math.pow((0.0216 * vel[i]), 2));

        fS[i] = vh.mass * grv * Math.sin(0);
        fR[i] = vh.mass * grv * fv[i] * Math.cos(0);
        fA[i] = (1/2) * 1.2041 * vh.cd * vh.al * Math.pow(vel[i],2);
        fT[i] = (tq[i] * vh.gears[nkp] * vh.fd * vh.kpd) / vh.rk;
        fF[i] = vh.mass * grv * 1.1 * 0.65;

        if (fT[i] > fF[i]) {
            fT[i] = fF[i];
        }

        acs[i] = (1/vh.mass) * (fT[i] - (fS[i] + fR[i] + fA[i]));
        pwr[i] = (tq[i] * (nd[i] * (Math.PI/30)))/1000;
        vel[i+1] = vel[i] + step * acs[i];
        s[i+1] = step * vel[i] + s[i];
        tqW[i] = tq[i] * vh.gears[nkp] * vh.fd * vh.kpd;
        gear[i] = nkp;

    }

    //var data = [0,chartTitle[0],axisTitle[0],en.nmin];
	//buildGraph(en.nInt,en.tqInt,en.pwrInt,data);

    chartType.addEventListener("change", changeChart);

    function changeChart() {
        //document.querySelector('.sim-results').style = "display:block;";
        var chartValue = chartType.value;

        if(chartValue == '8' || chartValue == '9') {
            var data = [2,chartTitle[chartValue],axisTitle[chartValue],0];
            
            if(chartValue == '8') {

                var temp = [];

                for(let i = 0; i < t.gmax; i++) {
                    temp[i] = {
                        name: ((i+1) + ' gear'),
                        data: makePoints(vls[i],d[i])
                    };
                }
                temp[t.gmax] = {
                    name: 'Resistance',
                    data: makePoints(vls[t.gmax-1],f[t.gmax-1])
                };
                data[4] = temp;
                buildGraph(data);
            }
            if(chartValue == '9') {

                var temp = [];

                for(let i = 0; i < t.gmax; i++) {
                    temp[i] = {
                        name: ((i+1) + ' gear'),
                        data: makePoints(vls[i],fuel[i])
                    };
                }

                data[4] = temp;
                buildGraph(data);
            }

        }
        if(chartValue == '0') {
            var data = [0,chartTitle[chartValue],axisTitle[chartValue],0,[makePoints(en.nInt,en.tqInt),makePoints(en.nInt,en.pwrInt)]];
            buildGraph(data);
        }
        var chArray = [null, nd, tq, pwr, tqW, acs, (vel.map(n => n * 3.6)), (gear.map(n => n + 1))];
        if(chartValue == '1' || chartValue == '2' || chartValue == '3' || chartValue == '4' || chartValue == '5' || chartValue == '6' || chartValue == '7') {
            var data = [1,chartTitle[chartValue],axisTitle[chartValue],0,makePoints(dt,chArray[chartValue])];
            buildGraph(data);
        }
    }

    function makePoints(x,y) {
        temp = [];
        for(let i = 0; i < x.length; i++) {
            temp[i] = [x[i],y[i]];
        }
        return temp
    }

    function buildTabe() {
        var dataParams = document.querySelectorAll('.p-value');
        var dataGet = [
            Math.floor(Math.max.apply(null, (vel.map(n => n * 3.6)))),   // Max Speed
            Math.floor(Math.max.apply(null, tqW)),                       // Max wheel torque
            round(Math.max.apply(null, acs), 3),                         // Max acceleration
            round(Math.max.apply(null, d[0]), 3),                        // Max D in low gear
            round(Math.max.apply(null, d[t.gmax - 1]), 3),               // Max D in top gear
        ];
        for(var i = 0; i < dataGet.length; i++) {
            dataParams[i].textContent = dataGet[i];
        }
    }

    changeChart(); 
    buildTabe();

}

function buildGraph(data) {

    if(data[0] == 0) {
        Highcharts.chart('graphs', {
            chart: {
                    type: 'scatter',
                    zoomType: 'xy',
                    height: 500,
                    backgroundColor: 'transparent'
            },
            title: {
                text: data[1],
                style: { "color": "#151515", "fontWeight": "bold" }
            },

            subtitle: {text: 'Source: 98h.org'},

            yAxis: [{
                title: {text: data[2][1]}
            }, 
                {title: {text: data[2][3]},
                opposite: true
            }],

            xAxis: {
                title: {text: data[2][0]}
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 50
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 4
                }
            },

            series: [{
                yAxis: 0,
                name: 'Engine Torque',
                data: data[4][0]
            },
            {
                yAxis: 1,
                name: 'Engine Power',
                data: data[4][1]
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }
    else if(data[0] == 1) {
       Highcharts.chart('graphs', {
            chart: {
                    type: 'scatter',
                    zoomType: 'xy',
                    height: 500,
                    backgroundColor: 'transparent'
            },
            title: {
                text: data[1],
                style: { "color": "#151515", "fontWeight": "bold" }
            },

            subtitle: {text: 'Source: 98h.org'},

            yAxis: [{
                title: {text: data[2][1]}
            }, 
                {title: {text: data[2][3]},
                opposite: true
            }],

            xAxis: {
                title: {text: data[2][0]}
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 50
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 4
                }
            },

            series: [{
                data: data[4]
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }
    else if(data[0] == 2) {

        Highcharts.chart('graphs', {
            chart: {
                    type: 'scatter',
                    zoomType: 'xy',
                    height: 500,
                    backgroundColor: 'transparent'
            },
            title: {
                text: data[1],
                style: { "color": "#151515", "fontWeight": "bold" }
            },

            subtitle: {text: 'Source: 98h.org'},

            yAxis: [{
                title: {text: data[2][0]}
            }],

            xAxis: {
                title: {text: data[2][1]},
                max: 250
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 50
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 4
                }
            },

            series: data[4],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });   
    }

}

simButton.addEventListener("click", acceleration);