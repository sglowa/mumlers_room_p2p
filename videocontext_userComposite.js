/*jshint esversion:6*/

// 1.observations :: 
// what works : stream -> video -> canvas -> videocontext
// seems super redundant and not the best way of approaching it
// i'd need a separate canvas for each composite stream to turn them into separate nodes 
// i might as well just overlay the canvases using CSS, but:
// what's nice about videocontext is the webgl nodes u can plug in.

// the origin + bounce streams can be composited using single canvas loop.

// what it would look like :

// o_str + b_str = comp1 => stream outgoing
//						 => videocontext; 
//						    videocontext <= canvas <= video <= incoming stream;

// hmm, might be quite a bottle neck
// especially since all the canvas (except of videocontext) have '2d' context;

// 2. i still need to get the transparency formula for blending equally. 

// 3. this need to modularized > 
	// module1. create canvas buffer for each stream.
	// module2. setup videocontext.

const parseVideo = (origin_str,bounced_str,callback)=>{

		// importing videcontext js, served via express (routes.js).
		const imported = document.createElement('script');
		imported.src = '/scripts/videocontext.js';
		document.head.appendChild(imported);

		const origin_vid = document.createElement('video');
		origin_vid.srcObject = origin_str;
		origin_vid.play(); 
		window.origin_vid = origin_vid; // exposed 4 testing
		const bounced_vid = document.createElement('video');
		bounced_vid.srcObject = bounced_str;
		bounced_vid.play();
		window.bounced_vid = bounced_vid; // exposed 4 testing
		// setting up buffer canvases
		const origin_cnv = document.createElement('canvas');
		const cnv_w = origin_str.getVideoTracks()[0].getSettings().width;
		const cnv_h = origin_str.getVideoTracks()[0].getSettings().height;
		origin_cnv.width = cnv_w;
		origin_cnv.height = cnv_h;
		
		const bounced_cnv = document.createElement('canvas');
		bounced_cnv.width = cnv_w;
		bounced_cnv.height = cnv_h;

		// buffering streams (stream => canvas frames)
		const render = ()=>{
			origin_cnv.getContext('2d').drawImage(origin_vid,0,0);
			bounced_cnv.getContext('2d').drawImage(bounced_vid,0,0);
			window.requestAnimationFrame(render);
		};
		render();

		
		imported.addEventListener('load',()=>{
			const canvas = document.createElement('canvas');
			canvas.setAttribute('class', 'videocontext');
			canvas.width = cnv_w;
			canvas.height = cnv_h;

			const vc = new VideoContext(canvas); window.vc = vc; // global scope for testing		
			const origin_cnv_node = vc.canvas(origin_cnv);
			origin_cnv_node.start(0);
			const bounced_cnv_node = vc.canvas(bounced_cnv);
			bounced_cnv_node.start(0);		
			const invertColEffectDescription = require('./shader_descriptions.js').invertColEffectDescription;
			const invertColors_node = vc.effect(invertColEffectDescription);
			bounced_cnv_node.connect(invertColors_node);
			const opacity_node = vc.effect(VideoContext.DEFINITIONS.OPACITY);		
			opacity_node.opacity = 0.5;
			invertColors_node.connect(opacity_node);

			origin_cnv_node.connect(vc.destination);
			opacity_node.connect(vc.destination);

			//now i need to pass bounced to fiter node.
			//i.e. i need to write a vertex && fragment shader 4 the effect node

			vc.play();	
			if(vc.state===0){
				callback(canvas);
			}				
		});
};

module.exports = parseVideo;

