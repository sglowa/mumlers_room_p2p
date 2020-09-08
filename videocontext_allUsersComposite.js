
// !. this needs to be modularized > 
	// module1. create canvas buffer for each stream.
	// module2. setup videocontext.

const parseVideo = (user_str,incoming_str,callback)=>{

		const user_vid = document.createElement('video');
		user_vid.srcObject = user_str;
		user_vid.play(); 
		window.user_vid = user_vid; // exposed 4 testing
		const incoming_vid = document.createElement('video');
		incoming_vid.srcObject = incoming_str;
		incoming_vid.play();
		window.incoming_vid = incoming_vid; // exposed 4 testing
		// setting up buffer canvases
		const user_cnv = document.createElement('canvas');
		const cnv_w = user_str.getVideoTracks()[0].getSettings().width;
		const cnv_h = user_str.getVideoTracks()[0].getSettings().height;
		user_cnv.width = cnv_w;
		user_cnv.height = cnv_h;
		
		const incoming_cnv = document.createElement('canvas');
		incoming_cnv.width = cnv_w;
		incoming_cnv.height = cnv_h;

		// buffering streams (stream => canvas frames)
		const render = ()=>{
			user_cnv.getContext('2d').drawImage(user_vid,0,0);
			incoming_cnv.getContext('2d').drawImage(incoming_vid,0,0);
			window.requestAnimationFrame(render);
		};
		render();
				
		const canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'videocontext');
		canvas.setAttribute('id', 'final_output');
		canvas.width = cnv_w;
		canvas.height = cnv_h;

		const vc = new VideoContext(canvas); window.vc = vc; // global scope for testing		
		const user_cnv_node = vc.canvas(user_cnv);
		user_cnv_node.start(0);
		const incoming_cnv_node = vc.canvas(incoming_cnv);
		incoming_cnv_node.start(0);		

		const opacity_node = vc.effect(VideoContext.DEFINITIONS.OPACITY);		
		opacity_node.opacity = 0.5;
		incoming_cnv_node.connect(opacity_node);

		user_cnv_node.connect(vc.destination);
		opacity_node.connect(vc.destination);

		vc.play();	
		if(vc.state===0){
			callback(canvas);
		}				
};

module.exports = parseVideo;

