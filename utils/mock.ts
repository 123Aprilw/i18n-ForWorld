import { icons } from './icons'

const { facility } = icons

export interface VenueAmenity {
	icon: string
	labelKey: string
}

export interface VenueBentoCard {
	image: string
	titleKey: string
	descKey: string
	spaceType: string
}

export interface Venue {
	id: string
	nameKey: string
	descKey: string
	image: string
	facilityIcons: string[]
	gallery: string[]
	locationKey: string
	experienceTitleKey: string
	experienceDescKey: string
	amenities: VenueAmenity[]
	bentoCards: VenueBentoCard[]
	hasVideo?: boolean
}

export interface Order {
	id: string
	venueKey: string
	dateKey: string
	date: string
	time: string
	seat: string
	status: 'reserved' | 'cancelled' | 'pending' | 'paid' | 'arrived'
	price: number
}

export interface Message {
	id: string
	type: 'notice' | 'reservation' | 'payment'
	titleKey: string
	contentKey: string
	time: string
	read: boolean
}

const defaultAmenities: VenueAmenity[] = [
	{ icon: '/static/images/venues/amenities/wifi.png', labelKey: 'venue.amenityWifi' },
	{ icon: '/static/images/venues/amenities/coffee-snack.png', labelKey: 'venue.amenityCoffee' },
	{ icon: '/static/images/venues/amenities/quiet.png', labelKey: 'venue.amenityQuiet' },
	{ icon: '/static/images/venues/amenities/meeting-room.png', labelKey: 'venue.amenityMeeting' },
	{ icon: '/static/images/venues/amenities/print-scan.png', labelKey: 'venue.amenityPrint' },
	{ icon: '/static/images/venues/amenities/ergonomic.png', labelKey: 'venue.amenityErgonomic' }
]

export const venues: Venue[] = [
	{
		id: '1',
		nameKey: 'venue.tokyoCentral',
		descKey: 'venue.tokyoCentralDesc',
		image: '/static/images/venues/venue-1.png',
		facilityIcons: [facility.wifi, facility.coffee],
		gallery: ['/static/images/venues/hero-1.png', '/static/images/venues/hero-2.png'],
		locationKey: 'venue.tokyoLocation',
		experienceTitleKey: 'venue.experienceTitle',
		experienceDescKey: 'venue.experienceDesc',
		amenities: defaultAmenities,
		bentoCards: [
			{
				image: '/static/images/venues/hero-1.png',
				titleKey: 'venue.bentoFocusTitle',
				descKey: 'venue.bentoFocusDesc',
				spaceType: 'focus'
			},
			{
				image: '/static/images/venues/hero-2.png',
				titleKey: 'venue.bentoCollabTitle',
				descKey: 'venue.bentoCollabDesc',
				spaceType: 'collab'
			}
		],
		hasVideo: true
	},
	{
		id: '2',
		nameKey: 'venue.shibuyaStudio',
		descKey: 'venue.shibuyaStudioDesc',
		image: '/static/images/venues/venue-2.png',
		facilityIcons: [facility.group, facility.palette],
		gallery: ['/static/images/venues/venue-2.png', '/static/images/venues/hero-2.png'],
		locationKey: 'venue.shibuyaLocation',
		experienceTitleKey: 'venue.shibuyaExperienceTitle',
		experienceDescKey: 'venue.shibuyaExperienceDesc',
		amenities: defaultAmenities,
		bentoCards: [
			{
				image: '/static/images/venues/hero-2.png',
				titleKey: 'venue.bentoCreativeTitle',
				descKey: 'venue.bentoCreativeDesc',
				spaceType: 'creative'
			},
			{
				image: '/static/images/venues/hero-1.png',
				titleKey: 'venue.bentoStudioTitle',
				descKey: 'venue.bentoStudioDesc',
				spaceType: 'studio'
			}
		]
	},
	{
		id: '3',
		nameKey: 'venue.osakaHub',
		descKey: 'venue.osakaHubDesc',
		image: '/static/images/venues/venue-3.png',
		facilityIcons: [facility.silence, facility.wood],
		gallery: ['/static/images/venues/venue-3.png', '/static/images/venues/hero-1.png'],
		locationKey: 'venue.osakaLocation',
		experienceTitleKey: 'venue.osakaExperienceTitle',
		experienceDescKey: 'venue.osakaExperienceDesc',
		amenities: defaultAmenities,
		bentoCards: [
			{
				image: '/static/images/venues/hero-1.png',
				titleKey: 'venue.bentoBusinessTitle',
				descKey: 'venue.bentoBusinessDesc',
				spaceType: 'executive'
			},
			{
				image: '/static/images/venues/hero-2.png',
				titleKey: 'venue.bentoCollabTitle',
				descKey: 'venue.bentoCollabDesc',
				spaceType: 'collab'
			}
		]
	},
	{
		id: '4',
		nameKey: 'venue.kyotoSpace',
		descKey: 'venue.kyotoSpaceDesc',
		image: '/static/images/venues/venue-4.png',
		facilityIcons: [facility.executive, facility.meeting],
		gallery: ['/static/images/venues/venue-4.png', '/static/images/venues/hero-1.png'],
		locationKey: 'venue.kyotoLocation',
		experienceTitleKey: 'venue.kyotoExperienceTitle',
		experienceDescKey: 'venue.kyotoExperienceDesc',
		amenities: defaultAmenities,
		bentoCards: [
			{
				image: '/static/images/venues/hero-1.png',
				titleKey: 'venue.bentoTradTitle',
				descKey: 'venue.bentoTradDesc',
				spaceType: 'trad'
			},
			{
				image: '/static/images/venues/hero-2.png',
				titleKey: 'venue.bentoFocusTitle',
				descKey: 'venue.bentoFocusDesc',
				spaceType: 'focus'
			}
		]
	}
]

export const orders: Order[] = [
	{ id: 'ORD001', venueKey: 'order.venueTokyoHub', dateKey: 'order.dateJun27', date: '2026-06-27', time: '14:00 - 18:00', seat: 'A-12', status: 'reserved', price: 2500 },
	{ id: 'ORD002', venueKey: 'order.venueKyotoZen', dateKey: 'order.dateJun20', date: '2026-06-20', time: '09:00 - 12:00', seat: 'B-05', status: 'reserved', price: 3000 },
	{ id: 'ORD003', venueKey: 'order.venueTokyoHub', dateKey: 'order.dateJun27', date: '2026-06-27', time: '14:00 - 18:00', seat: 'C-08', status: 'cancelled', price: 2000 },
	{ id: 'ORD004', venueKey: 'order.venueKyotoZen', dateKey: 'order.dateJun20', date: '2026-06-20', time: '09:00 - 12:00', seat: 'D-03', status: 'cancelled', price: 2800 },
	{ id: 'ORD005', venueKey: 'order.venueTokyoHub', dateKey: 'order.dateJun27', date: '2026-06-27', time: '14:00 - 18:00', seat: 'E-01', status: 'pending', price: 2500 },
	{ id: 'ORD006', venueKey: 'order.venueKyotoZen', dateKey: 'order.dateJun20', date: '2026-06-20', time: '09:00 - 12:00', seat: 'F-02', status: 'pending', price: 3000 },
	{ id: 'ORD007', venueKey: 'order.venueTokyoHub', dateKey: 'order.dateJun27', date: '2026-06-27', time: '14:00 - 18:00', seat: 'G-11', status: 'paid', price: 2500 },
	{ id: 'ORD008', venueKey: 'order.venueKyotoZen', dateKey: 'order.dateJun20', date: '2026-06-20', time: '09:00 - 12:00', seat: 'H-07', status: 'paid', price: 2800 },
	{ id: 'ORD009', venueKey: 'order.venueTokyoHub', dateKey: 'order.dateJun27', date: '2026-06-27', time: '14:00 - 18:00', seat: 'I-04', status: 'arrived', price: 2500 },
	{ id: 'ORD010', venueKey: 'order.venueKyotoZen', dateKey: 'order.dateJun20', date: '2026-06-20', time: '09:00 - 12:00', seat: 'J-09', status: 'arrived', price: 3000 }
]

export const messages: Message[] = [
	{ id: '1', type: 'notice', titleKey: 'message.newFacility', contentKey: 'message.newFacilityContent', time: '2026-06-01', read: false },
	{ id: '2', type: 'reservation', titleKey: 'message.reservationNotice', contentKey: 'message.reservationContent', time: '2026-06-08', read: false },
	{ id: '3', type: 'payment', titleKey: 'message.paymentNotice', contentKey: 'message.paymentContent', time: '2026-06-09', read: true },
	{ id: '4', type: 'payment', titleKey: 'message.paymentNotice', contentKey: 'message.paymentContent2', time: '2026-06-10', read: true }
]