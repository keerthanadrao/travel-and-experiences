/* ==========================================
   TRAVEL & EXPERIENCES - CORE STATE & ENGINE
   ========================================== */

// 1. Initial Sample Seed Data (Taxonomies, Destinations, Stories)
export const INITIAL_LOCATIONS = [
  { id: 'loc-1', name: 'India', level: 'Country', parentId: null },
  { id: 'loc-2', name: 'Karnataka', level: 'State', parentId: 'loc-1' },
  { id: 'loc-3', name: 'Kodagu', alias: 'Coorg', level: 'District', parentId: 'loc-2' },
  { id: 'loc-4', name: 'Madikeri', level: 'Destination', parentId: 'loc-3' },
  { id: 'loc-5', name: 'Goa', level: 'State', parentId: 'loc-1' },
  { id: 'loc-6', name: 'Hampi', level: 'Destination', parentId: 'loc-2' },
  { id: 'loc-7', name: 'Manali', level: 'Destination', parentId: 'loc-1' }
];

export const CANONICAL_EXPERIENCES = [
  'Nature', 'Adventure', 'Food', 'Culture', 'Heritage', 'Beach', 
  'Road Trip', 'Photography', 'Wellness & Relaxation', 'Backpacking', 
  'Family', 'Hidden Places', 'Slow Travel'
];

export const INITIAL_STORIES = [
  {
    id: 'story-1',
    title: 'Rainy Afternoons in a Coorg Coffee Estate',
    subheadline: 'Listening to the monsoon rhythm among misty hills and cardamom trails',
    author: { name: 'Aarav Sharma', avatar: 'A' },
    locationId: 'loc-4', // Madikeri
    locationPath: 'India -> Karnataka -> Kodagu -> Madikeri',
    experiences: ['Nature', 'Slow Travel', 'Hidden Places'],
    cardFrame: 'polaroid',
    coverMedia: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
    readingTime: '5 min read',
    upvotes: 248,
    upvotedByMe: false,
    savedByMe: false,
    richBody: `
      <h2>The Mist of Madikeri</h2>
      <p>There is a quiet spell that settles over Kodagu when the first drops of monsoon touch the coffee bushes. Walking down the winding narrow lane towards the estate, the scent of wet earth and wild jasmine fills the air.</p>
      <blockquote>"Coorg doesn't just reveal itself to the eyes; it speaks through the whispering canopy of old silver oak trees."</blockquote>
      <p>We spent three hours sitting on the wooden porch of a local family-run homestay, watching rain clouds drift lazily over the blue contour of the Western Ghats.</p>

      <div class="tip-box" style="background: var(--color-sand-beige); padding: 1rem 1.25rem; border-left: 4px solid var(--color-terracotta); border-radius: 4px; margin: 1.5rem 0;">
        <strong>Hidden Place Tip:</strong> Visit the quiet view point near Abbey Falls early at 06:30 AM before tourist crowds arrive. The morning mist creates a surreal photography setting.
      </div>

      <h3>Local Flavors</h3>
      <p>No trip to Kodagu is complete without trying authentic Akki Oti (rice roti) served with fresh bamboo shoot curry and home-brewed filter coffee sweetened with jaggery.</p>
    `,
    hiddenSpots: ['Quiet viewpoint behind Abbey Falls', 'Traditional coffee roasting unit in Madikeri town'],
    chapters: [
      { title: '01 Arrival in the Hills', content: 'Descending from Mysuru into the green slopes of Kodagu.' },
      { title: '02 The Estate Walk', content: 'Exploring cardamom and pepper vines under rain-soaked canopies.' },
      { title: '03 Sunset over Raja’s Seat', content: 'Watching golden twilight paint the valley hues.' }
    ],
    timeline: [
      { time: '08:00 AM', detail: 'Morning walking tour inside coffee estate' },
      { time: '12:30 PM', detail: 'Local Kodava lunch featuring Akki Roti & Pandi Curry' },
      { time: '04:30 PM', detail: 'Coffee tasting session at local plantation' }
    ]
  },
  {
    id: 'story-2',
    title: 'Golden Sunsets and Ancient Boulders of Hampi',
    subheadline: 'Cycling through timeless ruins and palm-lined riverbanks along the Tungabhadra',
    author: { name: 'Priya Nair', avatar: 'P' },
    locationId: 'loc-6', // Hampi
    locationPath: 'India -> Karnataka -> Hampi',
    experiences: ['Heritage', 'Culture', 'Photography', 'Backpacking'],
    cardFrame: 'postcard',
    coverMedia: 'https://images.unsplash.com/photo-1600100395162-43226363493d?auto=format&fit=crop&w=1000&q=80',
    readingTime: '7 min read',
    upvotes: 312,
    upvotedByMe: false,
    savedByMe: false,
    richBody: `
      <h2>Land of Stone Legends</h2>
      <p>Standing atop Matanga Hill as the sun dips below a horizon of giant granite boulders feels like stepping straight into an ancient epic story.</p>
      <p>Hampi demands slow exploration. Renting a vintage bicycle and riding past the Vitthala Temple complex offers a glimpse into a era when stone pillars played musical notes.</p>
    `,
    hiddenSpots: ['Anegundi river crossing coracle spot', 'Sunset viewpoint near Achyutaraya Temple'],
    chapters: [
      { title: '01 Stone Chariot Mysteries', content: 'Exploring Vijayanagara architectural grandeur.' },
      { title: '02 Across the River', content: 'Crossing by coracle boat to the hippy island side.' }
    ],
    timeline: [
      { time: '06:00 AM', detail: 'Sunrise trek up Matanga Hill' },
      { time: '11:00 AM', detail: 'Exploring Virupaksha Temple pillars' }
    ]
  },
  {
    id: 'story-3',
    title: 'Beyond the Beaches: Secret Spices & Backwaters of Goa',
    subheadline: 'Exploring quiet spice plantations and historic Portuguese mansions in South Goa',
    author: { name: 'Julian D’Souza', avatar: 'J' },
    locationId: 'loc-5', // Goa
    locationPath: 'India -> Goa',
    experiences: ['Beach', 'Food', 'Culture', 'Hidden Places'],
    cardFrame: 'journal',
    coverMedia: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    readingTime: '6 min read',
    upvotes: 189,
    upvotedByMe: false,
    savedByMe: false,
    richBody: `
      <h2>The Quiet Side of Sunshine State</h2>
      <p>While most travelers head straight to crowded beach shacks, South Goa hides tranquil backwater estuaries and century-old Portuguese heritage homes surrounded by cashew orchards.</p>
    `,
    hiddenSpots: ['Butterfly Beach secret cove access', 'Quiet bakery in Fontainhas serving fresh Bebinca'],
    chapters: [],
    timeline: []
  }
];

// App State Store
class AppState {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('te_user')) || null;
    this.locations = JSON.parse(localStorage.getItem('te_locations')) || INITIAL_LOCATIONS;
    this.stories = JSON.parse(localStorage.getItem('te_stories')) || INITIAL_STORIES;
    this.savedScrapbook = JSON.parse(localStorage.getItem('te_scrapbook')) || [];
    this.activeFilterExp = null;
    this.searchQuery = '';
    this.currentView = 'home'; // home, story, destination, profile, admin
    this.activeStoryId = null;
    this.activeLocationId = null;
    this.otpState = { email: '', otp: null, timer: 60, interval: null, resends: 0 };
  }

  save() {
    localStorage.setItem('te_user', JSON.stringify(this.currentUser));
    localStorage.setItem('te_locations', JSON.stringify(this.locations));
    localStorage.setItem('te_stories', JSON.stringify(this.stories));
    localStorage.setItem('te_scrapbook', JSON.stringify(this.savedScrapbook));
  }

  loginUser(user) {
    this.currentUser = user;
    this.save();
  }

  logoutUser() {
    this.currentUser = null;
    this.save();
  }

  toggleUpvote(storyId) {
    const story = this.stories.find(s => s.id === storyId);
    if (!story) return;
    if (story.upvotedByMe) {
      story.upvotes -= 1;
      story.upvotedByMe = false;
    } else {
      story.upvotes += 1;
      story.upvotedByMe = true;
    }
    this.save();
  }

  toggleSave(storyId) {
    const index = this.savedScrapbook.indexOf(storyId);
    if (index > -1) {
      this.savedScrapbook.splice(index, 1);
    } else {
      this.savedScrapbook.push(storyId);
    }
    const story = this.stories.find(s => s.id === storyId);
    if (story) story.savedByMe = this.savedScrapbook.includes(storyId);
    this.save();
  }

  addStory(newStory) {
    this.stories.unshift(newStory);
    this.save();
  }

  addLocation(newLoc) {
    this.locations.push(newLoc);
    this.save();
    return newLoc;
  }
}

export const state = new AppState();
