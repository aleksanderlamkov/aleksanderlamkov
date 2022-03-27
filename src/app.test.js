import './app'
import Dispatcher from './js/generic/dispatcher'
import Observer from './js/generic/observer'
import {locales} from './js/locales'
import {getByPropFromObj} from './js/utils/getByPropFromObj'

it('Коллекции инициализированы', () => {
  [Dispatcher, Observer].forEach(instance => expect(window.App[instance.name]).toBeInstanceOf(instance))
})

it('Все языковые ключи заданы', () => {
  expect(['ru', 'en'].map(lang => getByPropFromObj(locales, lang)).flat().every(value => value.length)).toBeTruthy()
})
