// Mock data sets (could later be fetched from APIs)
export const meetingRoles = [
  {
    name: 'Toastmaster of the Day', level: 'Core', summary: 'Guides the overall meeting flow and energy.', details: `Opens the meeting, introduces speakers, keeps agenda moving, and sets encouraging tone.`
  },
  { name: 'Ah-Counter', level: 'Support', summary: 'Listens for filler words and sounds.', details: 'Tracks ums, ahs, repeated phrases; reports counts to help members improve vocal variety and clarity.' },
  { name: 'Timer', level: 'Core', summary: 'Times speeches and segments.', details: 'Displays green/yellow/red signals; reports qualifying times for awards.' },
  { name: 'Grammarian', level: 'Support', summary: 'Highlights effective language and areas to improve.', details: 'Presents Word of the Day, listens for grammar usage, provides a language report.' },
  { name: 'Evaluator', level: 'Core', summary: 'Provides structured, constructive feedback.', details: 'Uses commend-recommend-commend method; focuses on objectives and growth.' },
  { name: 'General Evaluator', level: 'Core', summary: 'Evaluates meeting effectiveness.', details: 'Leads evaluation segment, introduces evaluators & reports on meeting quality.' },
  { name: 'Table Topics Master', level: 'Core', summary: 'Runs impromptu speaking segment.', details: 'Explains rules, prompts unrehearsed responses, encourages variety of participants.' },
  { name: 'Speaker', level: 'Core', summary: 'Delivers a prepared speech.', details: 'Practices a Pathways project objective and receives evaluation.' },
  { name: 'Jokemaster', level: 'Optional', summary: 'Adds levity with a short joke.', details: 'Warms up the room and transitions into prepared segments with humor.' }
];

export const tableTopics = [
  'What personal milestone are you most proud of and why?',
  'Describe a small act of kindness that had a big impact on you.',
  'If you could instantly master any new skill, which would it be?',
  'What does effective leadership look like to you?',
  'Share a lesson you learned from a recent setback.',
  'How do you recharge when you feel overwhelmed?',
  'If your life had a theme song this month, what would it be?',
  'What tradition from your culture do you cherish most?',
  'What book has influenced your communication style?',
  'How do you define success today vs five years ago?',
  'Describe a moment you stepped out of your comfort zone.'
];

export const words = [
  { word: 'Concise', part: 'adjective', definition: 'Giving a lot of information clearly and in a few words.', usage: 'Her concise summary clarified the complex issue.' },
  { word: 'Resilient', part: 'adjective', definition: 'Able to withstand or recover quickly from difficulties.', usage: 'His resilient mindset helped the team refocus.' },
  { word: 'Articulate', part: 'adjective', definition: 'Having or showing the ability to speak fluently and coherently.', usage: 'She gave an articulate explanation of the process.' },
  { word: 'Catalyst', part: 'noun', definition: 'Something that precipitates an event or change.', usage: 'The workshop was a catalyst for new ideas.' },
  { word: 'Synergy', part: 'noun', definition: 'Increased effectiveness resulting from combined effort.', usage: 'Their synergy elevated the project outcome.' }
];

export const themes = [
  'Innovation & Adaptability',
  'Gratitude in Action',
  'New Beginnings',
  'Overcoming Fear',
  'Storytelling Power',
  'Emotional Intelligence',
  'Cultural Connections',
  'Leadership Through Service'
];

export const resources = [
  // Core Toastmasters links
  { name: 'Find a Club', url: 'https://www.toastmasters.org/find-a-club' },
  { name: 'Pathways Learning Experience', url: 'https://www.toastmasters.org/education/pathways' },
  { name: 'Meeting Roles Overview', url: 'https://www.toastmasters.org/membership/club-meeting-roles' },
  // Full list imported from data/resources.csv
  { name: 'Table Topics Jeopardy', url: 'https://jeopardylabs.com/play/table-topics-jeopardy-5' },
  { name: 'Let the World Know Handbook', url: 'https://www.toastmasters.org/~/media/4961f7be4b244a12a39426d0c9193cd1.ashx' },
  { name: 'Brand Manual', url: 'https://toastmasterscdn.azureedge.net/medias/files/brand-materials/brand-items/brand-manual.pdf' },
  { name: 'Public Relations Resources', url: 'https://www.toastmasters.org/Leadership-Central/Club-Officer-Tools/Club-Officer-Roles/Public-Relations' },
  { name: 'Brand Portal', url: 'https://www.toastmasters.org/resources/brand-portal' },
  { name: 'Logo, Images, and Templates', url: 'https://www.toastmasters.org/resources/brand-portal/design-elements' },
  { name: 'Sample News Releases', url: 'https://www.toastmasters.org/leadership-central/club-officer-tools/club-officer-roles/public-relations/sample-news-releases' },
  { name: 'Video Release Form', url: 'https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/video-release-pr.pdf' },
  { name: 'Photo Release Form', url: 'https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/photo-release-pr.pdf' },
  { name: 'Toastmasters Media Center', url: 'https://mediacenter.toastmasters.org/' },
  { name: 'Toastmasters Media Kit', url: 'https://mediacenter.toastmasters.org/media-kit' },
  { name: 'D106 TM PR Kits', url: 'https://d106tm.org/public-relations/pr-kits-press-releases/' },
  { name: 'Video Library', url: 'https://www.toastmasters.org/resources/video-library' },
  { name: 'Background Images', url: 'https://www.toastmasters.org/resources/resource-library?t=background' },
  { name: 'Open House', url: 'https://www.toastmasters.org/resources/resource-library?t=open%20house' },
  { name: 'Social Media Management Tools', url: 'https://www.wordstream.com/blog/ws/2018/01/17/best-free-social-media-management-tools' },
  { name: 'PowerPoint Templates', url: 'https://www.toastmasters.org/resources/resource-library?rt=87f582b2-f714-4fa7-ac5b-9f36d8cf2a40&t=powerpoint' },
  { name: 'Press Release Kit', url: 'https://blog.hubspot.com/marketing/press-release-template-ht' },
  { name: 'Trademark Use Request', url: 'https://www.toastmasters.org/resources/brand-portal/trademark-use-request' },
  { name: 'District Leadership Handbook', url: 'https://www.toastmasters.org/Resources/District-Leadership-Handbook' },
  { name: 'Facebook Ad Campaign', url: 'https://toastmasterscdn.azureedge.net/medias/files/digital-ad-campaigns/2021-march-ads/477f-facebook-ad-guide/477f-facebook-ad-guide.pdf' },
  { name: 'Find Media Outlets', url: 'https://mondotimes.com/' },
  { name: 'Shorten your URLs', url: 'https://bitly.com/' },
  { name: "Find what's happening  in social media", url: 'https://www.socialmediatoday.com/' },
  { name: "Find what's best hashtag to use", url: 'https://best-hashtags.com/' },
  { name: 'Stock Photography', url: 'https://toastmasters.photoshelter.com/galleries' },
  { name: 'Lumen 5', url: 'https://lumen5.com/' },
  { name: 'Buffer', url: 'https://buffer.com/' },
  { name: 'Kahoots', url: 'https://kahoot.it/' },
  { name: 'Procreate', url: 'https://procreate.art/' },
  { name: 'Giphy', url: 'https://giphy.com/' },
  { name: 'Recognition', url: 'https://www.toastmasters.org/shop/recognition' },
  { name: 'Canva', url: 'https://www.canva.com/' },
  { name: 'Social Pilot', url: 'https://www.socialpilot.co/' },
  { name: 'Pic Monkey', url: 'https://www.picmonkey.com/' },
  { name: 'Agora Pulse', url: 'https://www.agorapulse.com/' },
  { name: 'FreeToastHost', url: 'https://www.toastmasters.org/resources/brand-portal/club-and-district-websites' },
  { name: 'Request a FTH website', url: 'https://www.toastmastersclubs.org/welcome/?Yor2' },
  { name: 'Mobile App', url: 'https://www.toastmasters.org/Membership/Club-Meeting-Roles/Mobile-App' },
  { name: 'Whova', url: 'https://whova.com/virtual-conference-platform/' },
  { name: 'Cision PR Newswire', url: 'https://www.prnewswire.com/' },
  { name: 'Prowly', url: 'https://prowly.com/' },
  { name: 'PicMonkey', url: 'https://www.picmonkey.com/' },
  { name: 'Animoto', url: 'https://animoto.com/' },
  { name: 'Descript', url: 'https://www.descript.com/tools' },
  { name: 'Riverside FM', url: 'https://riverside.fm/' },
  { name: 'StreamYard', url: 'https://streamyard.com/' },
  { name: 'Davinci Resolve', url: 'https://www.blackmagicdesign.com/products/davinciresolve' },
  { name: 'Marshalls TM Tools', url: 'http://marshalls.org/tmtools/' }
];
