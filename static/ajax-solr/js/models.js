(function ($) {

    FROMS={
      from_publications:false,
      from_observations:false,
      from_objects:false  
    };
    
    ObservationModel=Backbone.Model.extend({
    //We'll just initialize with an attribute dict passed into constructor by Collection.
        initialize: function(models, options){
            this.froms=FROMS;
            if (options && options.from_publications && options.from_publications===true){
                this.froms.from_publications=true;
                this.initializeFromPublication(models, options);
            } else {
                this.froms.from_observations=true;
                this.initializeFromObservation(models, options);
            }
        },
        initializeFromPublication: function(models, options){
            
        },
        initializeFromObservation: function(models, options){
            
        }
    });

    ObjectModel=Backbone.Model.extend({
    //We'll just initialize with an attribute dict passed into constructor by Collection.
    });
    

    
    //Later this can be used to get doc from server by overriding sync. Challenge is how to make it useful
//for the general case, perhaps by making simple dictionary copies.
    ObservationCollection=Backbone.Collection.extend({
        initialize: function(models, options){
            this.froms=FROMS;
            this.passed_options={};
            _.extend(this.passed_options, options);
            if (options && options.from_publications && options.from_publications===true){
                this.froms.from_publications=true;
                this.initializeFromPublication(models, options);
            } else {
                this.froms.from_observations=true;
                this.initializeFromObservations(models, options);
            }
        },
        initializeFromObservations: function(models, options){
            
        },
        initializeFromPublication: function(models, options){
            this.pubmodel=options.pubmodel;
            //alert("OCI: "+this.models.length);
            this.doc=this.pubmodel.toJSON();
            this.missionmap={};
            //if this array is not present, because a pub had nothing, we need to deal with that: BUG
            //BUG2: we have lost pagination
            this.nobs=0;
            if (this.doc.obsids_s !== undefined){
                this.nobs=this.doc.obsids_s.length;
            }
        },
        populate: function(){
            if (this.froms.from_publications===true){
                this.populateFromPublication();
            } else {
                this.populateFromObservations();
            }
        },
        populateFromObservations: function(){
            
        },
        populateFromPublication: function(){
            var doc=this.doc;
            var docid=this.doc.id;
            var docbibcode=this.doc.bibcode;
            var theobsids=doc.obsids_s;
            var nobs=this.nobs;
            //alert(nobs);
            var damodels=[];
            var datargets=[];
            for (var i = 0; i < nobs; i += 1) {
                //alert(obsids[i]);
	            var toks = theobsids[i].split('/');
	            var mission = toks[0];
	            var obsid=toks[1];
	            //console.log("LLLLLLL",mission);
	            var out = {
	                   mission: mission,
	                   docid: docid,
	                   bibcode: docbibcode,    
		               obsids_s: obsid,
		               exptime_f: doc.exptime_f[i],
		               obsvtime_d: doc.obsvtime_d[i],
		               targets_s: doc.targets_s[i].split('/', 2)[1],
		               ra_f: doc.ra_f[i],
		               dec_f: doc.dec_f[i]
		        };
		        //this.add(out, {silent:true});
		        damodels.push(out);
		        datargets.push(out.obsids_s);
	            if (this.missionmap[mission] === undefined) {
		            this.missionmap[mission] = [obsid];
	            } else {
		            this.missionmap[mission].push(obsid);
	            }

	            //this.add(out);
	            //currently use add, later use reset and build all views together to avoid firing so many events
	        }
	        //alert(datargets.join("%%"));
	        this.passed_options.silent=true;
	        this.add(damodels, this.passed_options);
	        /*this.each(function(mod){
	           alert(objToString(mod.attributes));
	        });*/
	        //alert(this.pluck('obsidss').join('::'));
	        //alert(this.models.length);
	        var missions = [];
	        var mastmissions = [];
	        for (mission in this.missionmap) {
	            this.missionmap[mission].sort(compareObsv);
	            missions.push(mission);
	            if (mission !== "CHANDRA") { mastmissions.push(mission); }
	        }
	        missions.sort();
	        mastmissions.sort();
	        this.missions=missions;
	        this.mastmissions=mastmissions;

        },
        comparator: function(observationmodel){
            //couldnt we just return the slashed obsid
            var mission=observationmodel.get('mission');
            var obsids_s=observationmodel.get('obsids_s');
            return mission+'_'+obsids_s;
        }
    });
    
    ObjectCollection=Backbone.Collection.extend({
       initialize: function(models,options){
            this.pubmodel=options.pubmodel;
            this.doc=this.pubmodel.toJSON();

            //if this array is not present, because a pub had nothing, we need to deal with that: BUG
            //BUG2: we have lost pagination
            this.nobj=0;
            if (this.doc.objectnames_s !== undefined){
                this.nobj=this.doc.objectnames_s.length;
            }
            //alert("Hello"+this.nobj);
        },
        populate: function(){
            var doc=this.doc;
            var docid=this.doc.id;
            var docbibcode=this.doc.bibcode;
            var objectnames=doc.objectnames_s;
            var objecttypes=doc.objecttypes_s;
            var nobj=this.nobj;
            for (var i = 0; i < nobj; i += 1) {
	            var out = {
	                   "docid": docid,
	                   "bibcode": docbibcode,    
		               "name": objectnames[i],
		               "objtype": objecttypes[i],
		        };
	            this.add(out, {silent:true})
	            //currently use add, later use reset and build all views together to avoid firing so many events
	        }
	       
        },
        comparator: function(objectmodel){
            return objectmodel.get('name');
        }
    });

    PublicationModel=Backbone.Model.extend({
        initialize: function(models, options){
            this.froms=FROMS;
            if (options && options.from_observations && options.from_observations===true){
                this.froms.from_observations=true;
                this.initializeFromObservation(models, options);
            } else {
                this.froms.from_publications=true;
                this.initializeFromPublication(models, options);
            }
        },
        initializeFromObservation: function(models, options){
            
        },
        initializeFromPublication: function(models, options){
            options.pubmodel=this
            this.observationcollection=new ObservationCollection([],options);
            this.objectcollection=new ObjectCollection([],options);
        }
    });
    PublicationCollection=Backbone.Collection.extend({
        initialize: function(models, options){
            this.froms=FROMS;
            //this.passed_options=options;
            this.passed_options={};
            _.extend(this.passed_options, options);
            if (options && options.from_observations && options.from_observations===true){
                this.froms.from_observations=true;
                this.initializeFromObservation(models, options);
            } else {
                this.froms.from_publications=true;
                this.initializeFromPublications(models, options);
            }
        },
        initializeFromObservation: function(models, options){
            
        },
        initializeFromPublications: function(models, options){
            this.docids=[];
            this.manager=options.ajaxsolrmanager;
            //alert("PCI: "+objToString(this.models[0].attributes));
            //alert("PCI2: "+objToString(ajaxsolrmanager));
        },
        populate:function(){
          if (this.froms.from_observations===true){
              this.populateFromObservation();
          } else {
              this.populateFromPublications();
          }
        },
        populateFromObservation: function(){
            
        },
        populateFromPublications: function(){
            for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
              var doc = this.manager.response.response.docs[i];

              var result=new PublicationModel(doc, this.passed_options);
              this.add(result)
              //this.add(doc, {from_publications:this.froms.from_publications})
              this.docids.push(doc.id);
            }
        }
    });

})(jQuery);
