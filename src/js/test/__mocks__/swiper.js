class MockSwiper {
}

const Swiper = jest.fn((() => new MockSwiper()))
const Navigation = jest.fn()
const Mousewheel = jest.fn()
const Keyboard = jest.fn()
const Autoplay = jest.fn()
const Pagination = jest.fn()
const use = jest.fn()

export default {use, Swiper, Navigation, Mousewheel, Keyboard, Autoplay, Pagination}
