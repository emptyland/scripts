var data = {
    message: [],
    button: [],
    inputs: [
        {name: 'i1', value: '11111111111'},
        {name: 'i2', value: '22222222222'},
        {name: 'i3', value: '33333333333'},
        {name: 'i4', value: '44444444444'},
        {name: 'i5', value: '55555555555'},
        {name: 'i6', value: '66666666666'}
    ],
    rows: [
        {
            id: 0, i1: 1, i2: 2, i3: 3, i4: '444444444444', i5: 5.5,
            i6: 6, i7: 'hello', i8: '88888888888888888888', i9: 9.9,
            i10: 10, i11: 11, i12: 12, i13: 13, i15: 15151515, i16: 16,
            i17: 17, i18: 18, i19: 19, i20: 20, i21: 21212121, i22: 22,
            i23: 23, i24: 24, i25: 25, i26: 26, i27: 27, i28: 28
        }
    ]
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
    return <div className='row'>
    {
        data.message.map(function (name) {
            return <div className='col-md-1'>{name}</div>
        })
    }
    </div>
  }
}

class Buttons extends React.Component {
    render() {
        return <div className='row'>
        {
            data.button.map(function (name) {
                return <div className='col-md-2'>
                    <button type='button' className='btn btn-default'>{name}</button>
                </div>
            })
        }
        </div>
    }
}

class Inputs extends React.Component {
    render() {
        return <div className='row'>
        {
            data.inputs.map(function (input) {
                return <div className='col-md-2'>
                    <div className='input-group'>
                        <span className='input-group-addon' id='basic-addon1'>{input.name}</span>
                        <input type='text' className='form-control' placeholder='input' aria-describedby='basic-addon1' />
                    </div>
                </div>
            })
        }
        </div>
    }
}

class Table extends React.Component {
    render() {
        return <div className='row'>
            <table className='table'>
                <tr>
                    <th>id</th>
                    <th>i1</th>
                    <th>i2</th>
                    <th>i3</th>
                    <th>i4</th>
                    <th>i5</th>
                    <th>i6</th>
                    <th>i7</th>
                    <th>i8</th>
                    <th>i9</th>
                    <th>i10</th>
                    <th>i12</th>
                    <th>i13</th>
                    <th>i14</th>
                    <th>i15</th>
                    <th>i16</th>
                    <th>i17</th>
                    <th>i18</th>
                    <th>i19</th>
                    <th>i20</th>
                    <th>i21</th>
                    <th>i22</th>
                </tr>
                {
                    data.rows.map(function(row) {
                        return <tr>
                            <td>{row.id}</td>
                            <td>{row.i1}</td>
                            <td>{row.i2}</td>
                            <td>{row.i3}</td>
                            <td>{row.i4}</td>
                            <td>{row.i5}</td>
                            <td>{row.i6}</td>
                            <td>{row.i7}</td>
                            <td>{row.i8}</td>
                            <td>{row.i9}</td>
                            <td>{row.i10}</td>
                            <td>{row.i12}</td>
                            <td>{row.i13}</td>
                            <td>{row.i14}</td>
                            <td>{row.i15}</td>
                            <td>{row.i16}</td>
                            <td>{row.i17}</td>
                            <td>{row.i18}</td>
                            <td>{row.i19}</td>
                            <td>{row.i20}</td>
                            <td>{row.i21}</td>
                            <td>{row.i22}</td>
                        </tr>
                    })
                }
            </table>
        </div>
    }
}

ReactDOM.render(
    <div className='container'>
        <HelloWorld />
        <Buttons />
        <Inputs />
        <Table />
    </div>,
    document.getElementsByTagName('body')[0]
);