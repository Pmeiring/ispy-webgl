
$(function() {
  ispy.init();
  ispy.addGroups();
  ispy.initLight();
  ispy.initDetector();
  ispy.loadWebFiles('./data/masterclass.json');
  ispy.run();

  console.log(ispy.event_description);
});
