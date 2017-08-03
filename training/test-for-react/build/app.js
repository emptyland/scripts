var data = {
    message: [],
    button: [],
    inputs: [{ name: 'i1', value: '11111111111' }, { name: 'i2', value: '22222222222' }, { name: 'i3', value: '33333333333' }, { name: 'i4', value: '44444444444' }, { name: 'i5', value: '55555555555' }, { name: 'i6', value: '66666666666' }],
    rows: [{
        id: 0, i1: 1, i2: 2, i3: 3, i4: '444444444444', i5: 5.5,
        i6: 6, i7: 'hello', i8: '88888888888888888888', i9: 9.9,
        i10: 10, i11: 11, i12: 12, i13: 13, i15: 15151515, i16: 16,
        i17: 17, i18: 18, i19: 19, i20: 20, i21: 21212121, i22: 22,
        i23: 23, i24: 24, i25: 25, i26: 26, i27: 27, i28: 28
    }]
};

for (var i = 0; i < 12; i++) {
    data.message.push('Hello, World');
}
for (var i = 0; i < 6; i++) {
    data.button.push('Button');
}
for (var i = 1; i < 1000; i++) {
    data.rows.push({
        id: i, i1: 1, i2: 2, i3: 3, i4: '444444444444', i5: 5.5,
        i6: 6, i7: 'hello', i8: '88888888888888888888', i9: 9.9,
        i10: 10, i11: 11, i12: 12, i13: 13, i15: 15151515, i16: 16,
        i17: 17, i18: 18, i19: 19, i20: 20, i21: 21212121, i22: 22,
        i23: 23, i24: 24, i25: 25, i26: 26, i27: 27, i28: 28
    });
}

class HelloWorld extends React.Component {
    render() {
        return React.createElement(
            'div',
            { className: 'row' },
            data.message.map(function (name) {
                return React.createElement(
                    'div',
                    { className: 'col-md-1' },
                    name
                );
            })
        );
    }
}

class Buttons extends React.Component {
    render() {
        return React.createElement(
            'div',
            { className: 'row' },
            data.button.map(function (name) {
                return React.createElement(
                    'div',
                    { className: 'col-md-2' },
                    React.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-default' },
                        name
                    )
                );
            })
        );
    }
}

class Inputs extends React.Component {
    render() {
        return React.createElement(
            'div',
            { className: 'row' },
            data.inputs.map(function (input) {
                return React.createElement(
                    'div',
                    { className: 'col-md-2' },
                    React.createElement(
                        'div',
                        { className: 'input-group' },
                        React.createElement(
                            'span',
                            { className: 'input-group-addon', id: 'basic-addon1' },
                            input.name
                        ),
                        React.createElement('input', { type: 'text', className: 'form-control', placeholder: 'input', 'aria-describedby': 'basic-addon1' })
                    )
                );
            })
        );
    }
}

class Table extends React.Component {
    render() {
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'table',
                { className: 'table' },
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        null,
                        'id'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i1'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i2'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i3'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i4'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i5'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i6'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i7'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i8'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i9'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i10'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i12'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i13'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i14'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i15'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i16'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i17'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i18'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i19'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i20'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i21'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'i22'
                    )
                ),
                data.rows.map(function (row) {
                    return React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            null,
                            row.id
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i1
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i2
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i3
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i4
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i5
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i6
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i7
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i8
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i9
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i10
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i12
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i13
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i14
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i15
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i16
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i17
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i18
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i19
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i20
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i21
                        ),
                        React.createElement(
                            'td',
                            null,
                            row.i22
                        )
                    );
                })
            )
        );
    }
}

ReactDOM.render(React.createElement(
    'div',
    { className: 'container' },
    React.createElement(HelloWorld, null),
    React.createElement(Buttons, null),
    React.createElement(Inputs, null),
    React.createElement(Table, null)
), document.getElementsByTagName('body')[0]);