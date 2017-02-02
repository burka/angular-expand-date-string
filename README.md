# Angular Expand Date String

Expand date input string ```30.2.00``` or ```300200``` to ```30.02.2000``` on blur.
 
Only for ```DD.MM.YYYY``` formats - merge requests (with tests) welcome .

# Install

    npm install --save angular-expand-date-string

# Usage

Just add ```expand-date-string``` to a text input and it will format the input on blur.

    <input ng-model="start" type="text" expand-date-string></input>