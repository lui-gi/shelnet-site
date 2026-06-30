This file contains the planning, documentation, and proposed spec for the shelnet wiki section.

The wiki section, in the resource locator = /wiki/, shall contain the following:
- compilation of my most recent cert notes (which for now is just security+)
- compilation of writeups
- some guides
- all of the above are in my writing / style 

There should also be a feature we work on where I can send you some rough, unorganized notes, and based on what I send you, you will be able to replicate it into a structured note/wiki entry in my voice. The specifics are below:
- have a dedicated agent that parses through some of my notes where my voice / writing style is evident, then ingests the style and is able to replicate it
- any note i send over for ingestion as a wiki entry should be reorganized, restructured, formatted, and my style should be applied to it.
	- further specifics of my writing style: during explanations, i like defaulting to lowercase (except for acronyms )

I need assistance planning the architecture of the wiki, as well as scaffolding for the shelnet-wiki (possibly) external repository. I also need to refine the creation of the STYLE-AGENT.md for whenever I need to invoke its skills for ingesting my rough notes.

As for the UI of the wiki, I simply want to imitate the standard wiki style. That is, comprehensive sidebar and search bar, indexing / ToC on the top of each note, and a main page that contains the most recent entries and some suggested topic areas. For some eye candy, I wanted to add the obsidian graph view, where connected entries are connected with an edge in the graph.
