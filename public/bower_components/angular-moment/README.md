angular-moment
==============

Wrapper for moment.js

Bower Install
-------------
```json
"dependencies": {
   "momentjs": "~2.6.0",
   "angular-moment": "jcamelis/angular-moment"
}
```

Filters
-------
* add [moment docs](http://momentjs.com/docs/#/manipulating/add/)
```javascript
moment("2014-11-24T05:45:00Z").add('days', 5).calendar()
```
```html
<p>{{ "2014-11-24T05:45:00Z" | momentAdd:'days':5 | momentCalendar }}</p>
```
output: 11/29/2014

* calendar
```javascript
moment("2014-11-24T05:45:00Z").calendar();
```
```html
<p>{{ "2014-11-24T05:45:00Z" | momentCalendar }}</p>
```
output: 11/24/2014

* day
```javascript
moment("2014-11-24T05:45:00Z").day("2014-11-29T05:45:00Z");
```
```html
<p>{{"2014-12-27T05:45:00Z" | momentDay}}</p>
```
output: 6

* dayOfYear
```javascript
moment("2014-02-24T05:45:00Z").dayOfYear();
```
```html
<p>{{"2014-02-24T05:45:00Z" | momentDayOfYear}}</p>
```
output: 55

* diff
```javascript
moment("2014-11-24T05:45:00Z").diff("2014-11-29T05:45:00Z");
```
```html
<p>{{"2014-11-24T05:45:00Z" | momentDiff:"2014-11-29T05:45:00Z"}}</p>
```
output: -432000000

* daysInMonth
```javascript
moment("2012-02").daysInMonth();
```
```html
<p>{{"2012-02" | momentDaysInMonth}}</p>
```
output: 29

* enOf
```javascript
moment().endOf("week");
```
```html
<p>{{"week" | momentEndOf}}</p>
```
output: "2014-05-25T02:59:59.999Z"

* toJSON
```javascript
moment().toJSON();
```
```html
<p>{{"2014-11-24" | momentToJSON}}</p>
```
output: 2014-11-24T03:00:00.000Z

* format
```javascript
moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
```
```html
<p>{{"2014-11-24T05:45:00Z" | momentFormat:"dddd, MMMM Do YYYY, h:mm:ss a"}}</p>
```
output: Monday, November 24th 2014, 2:45:00 am
from moment docs

* from
```javascript
moment("2014-05-21T15:08:00Z").from("2014-04-21T15:08:00Z");
```
```html
<p>{{"2014-05-21T15:08:00Z" | momentFrom:"2014-04-21T15:08:00Z"}}</p>
```
output: in a month

* fromNow
```javascript
moment("2014-05-20T09:45:00Z").fromNow();
```
```html
<p moment-interval="1000">{{"2014-05-21T14:25:00Z" | momentFromNow}}</p>
```
output: a few seconds ago

* get
```javascript
moment("2014-05-21T15:08:00Z").get();
```
```html
<p >{{"2011-05-21T15:08:00Z" | momentGet:'year'}}</p>
```
output: 2011

* hour
```javascript
moment().hour(Number);
```
```html
<p >{{"2011-05-21T15:08:00Z" | momentHour:10}}</p>
```
output: "2011-05-21T05:08:00.000Z"

* utc
```javascript
moment("2015-01-29T00:00:00Z").utc().format("DD MM YYYY");
```
```html
<p>{{"2015-01-29T00:00:00Z" | momentUtc | momentFormat: "D MMM, HH:mm"}}</p>
```
output: 29 Jan, 00:00
    
* zone
```javascript
moment(1404462900000).zone("-5").format("D MMM, HH:mm");
```
```html
<p>{{1404462900000 | momentZone:-5 | momentFormat: "D MMM, HH:mm"}}</p>
```
output: "4 Jul, 08:35"

Directives
----------

* momentInterval

```html
<p moment-interval="1000">{{"2014-05-21T14:25:00Z" | momentFromNow}}</p>
```