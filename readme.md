# LogMyPos
## Voice integrated - Location Failsafe and logging tool

So I don't really have regular contact with any relatives or family members, which means that in a worst case scenario, if 
something were to happen to me while I was out and about, it would be at least a few weeks before anyone could respond.

To allieviate this risk, without having to go to the trouble of setting up regular meetings with family members, I've made this 
system to keep track of where I am.

The system works as follows:

When I leave my accommodation, I state
                         "Alexa, tell log my position, I'm leaving."
at which point Alexa responds with
                         "and what time will you be back?"
to which I can simply state what time I would expect to be back.

When I return home, I can simply say
                          "Alexa, tell log my position, I'm back"
at which point my time of departure and return are logged into a Google spreadsheet for future use.

If I fail to return home by the expected time, the system will use the Twillio api to send me a warning text message, informing me of my delay.
In response to this text, I can choose to extend the return time by responding with a later time - this is to deal with the dynamic nature
of my interactions, and the various ways unexpected events can occur.

Following the warning, if I fail to respond still after a specified amount of time, the system will send out emergency texts to a specified 
contact, informing them of this abnormality.


Alongside this, the system also provides me the utility to use Alexa to log my morning and evening run times and place them
straight into a google spreadsheet for later use.
