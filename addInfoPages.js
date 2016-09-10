'use strict';

const knex = require('knex')({
  client: 'mysql',
  connection: {
    // The host where the MariaDB is located
    "host": "127.0.0.1",
    // The username to login to the DB with
    "user": "root",
    // The password for the given user
    "password": "password",
    // The name of The Gazelle's database in the MariaDB
    "database": "the_gazelle",
    "charset": 'latin1'
  },
  pool: {
    max: 2000,
    min: 0
  }
});


const infoPages = [
    {
        title: "About",
        slug: "about",
        html: "<p>The Gazelle is a weekly student publication, founded by Alistair Blacklock and Amanda Randone in 2013, serving the NYU Abu Dhabi community and the NYU&#8217;s greater global network. The Gazelle allows its undergraduate writers and photographers to cover campus and local news and is published online.</p> <p >The Gazelle is run solely by current undergraduate students. The editors are committed to operating as editorially and financially independent of the university. The Gazelle is an online platform available to the public because the editors believe students interested in professional journalism will not settle on publishing their work when they cannot share it, via social media or email, with people outside the institution. The editors believe that a thoughtful, structured and self-consciously public publication will provide this while creating a framework for constructive discourse. This is the best medium for hosting student voices, stories and ideas than alternative forms of publication. At a time when anyone can publish their work online we see it not only important but vital that students do so collectively.</p> <p>Opinions expressed in The Gazelle are by editors or columnists and are not those of The Gazelle. Unsigned editorials are all the collective opinion of the Editorial Board. The Gazelle encourages readers to voice their opinions respectfully. Comments are not pre-moderated, but The Gazelle reserves the right to remove comments if deemed to be in violation of this policy. Comments should remain on topic, concerning the article or blog post to which they are connected. Brevity is encouraged.</p> <p>A comment will be deleted if:</p><ul><li>The comment attacks a named or identified person or group unreasonably,</li><li>The comment makes readers unreasonable uncomfortable on the basis of one’s race, gender, religion, disability, ethnicity or otherwise,</li><li>The comment attacks personally any NYUAD or Gazelle staff,</li><li>The comment contains excessive obscenities,</li><li>It is determined that the comment is made under a false name or uses another person’s name or email address,</li><li>The comment threatens or encourages violence,</li><li>The comment encourages illegal behavior,</li><li>The comment violates copyright or privacy protections,</li><li>The comment contains personal information,</li><li>Or the comment is completely off-topic or determined to be spam</li></ul><br>",
    },
    {
        title: "Code of Ethics",
        slug: "ethics",
        html: '<p>The Gazelle follows a code of ethics to ensure fair and accurate journalism is practiced in accordance with the laws of the UAE. The following is adapted from the <a href="//gulfnews.com/about-gulf-news/help/code-of-ethics-1.446056"> Code of Ethics of the Gulf News</a> and the UAE journalism code of ethics:</p><ol><li ><p >Respect the truth and the right of the public to have access to truthful and accurate information.</p></li><li ><p >While performing his or her duty, the journalist is demanded to commit at all times to the principles of freedom and integrity in gathering and publishing stories. He or she should also voice fair and neutral comments and criticism.</p></li><li ><p >A journalist must only publish facts from known sources, and must not hide any basic or important information, forge facts or falsify documents.</p></li><li ><p >He or she should use only legitimate means to obtain information, photos and documents from original sources.</p></li><li ><p >Journalists should undertake to rectify any published information that proved to be false.</p></li><li ><p >There should be no compromise in credibility.</p></li><li ><p >Journalists should respect the privacy of individuals. If personal conduct conflicts with public interest, such conduct may be covered without violating the privacy of uninvolved individuals, to the extent that this is possible.</p></li><li ><p >In regards to sources, the code and charter stress that professionalism and confidentiality should be strictly observed if the source demands anonymity.</p></li><li ><p >Journalists should not seek to provoke or inflame public feelings by any means, or use means of excitement and deception or dishonest reporting. They should not use media for the purpose of libel or slandering.</p></li><li ><p >The edited publications should not be influenced by personal interests or businesses with a third party. Publishers and editors-in-chief must turn down any such attempts, and draw a clear line between reported stories and commercial articles or publications.</p></li><li ><p >Journalists should be very vigilant to traps of discrimination and avoid involving themselves by any means in any stories hinting to discrimination of race, sex, language, faith or national and social backgrounds.</p></li><li ><p >Journalists must strive to be impartial in reporting and avoid conflicts of interest with their stories.</p></li><li ><p >The media should refrain from publishing photos that are very graphic or violent in nature.</p></li><li ><p >Journalists are urged to avoid using obscene or offensive language in their reports.</p></li><li ><p >Islam is a basic and important component of UAE culture, values and traditions, and the respect of religious and traditional values is crucial for sensitive publishing.</p></li><li ><p >Human rights should be respected and valued by the media.</p></li><li ><p >Plagiarism, ill-intention interpretation, libel, slandering, censure, defamation, allegation and accepting bribery to publish or hide information are all dangerous professional violations.</p></li><li ><p >When using facts found in news publications, journalists must give credit to the original publication.</p></li><li ><p >Competing for news, pictures and information is a right, provided practicing such competition is honest and clear and does not hinder the work of colleagues in competing publications.</p></li><li ><p >A journalist has to do his or her best not to become part of a story, and to cover news not make it. While gathering information, a journalist may not present himself as anything other than a journalist.</p></li><li ><p >Journalists must not acquire information or pictures through harassment, temptation or violence.</p></li><li ><p >Accepting valuable cash and kind gifts may cause a journalist to be biased in his coverage and is considered a breach of the code.</p></li></ol><p><em>Published March 2013. Updated January 2014.</em></p>',
    },
];
knex("info_pages").del().then(() => {
    knex("info_pages").insert(infoPages).then(() => {
        console.log("Success");
        knex.destroy();
    });
});
