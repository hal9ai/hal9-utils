const isDate = str => {
  if(str.toString() === parseFloat(str).toString()) return false;

  const tryDate = new Date(str);
  const strTryDate = tryDate.toString();

  return (tryDate && strTryDate !== 'NaN' && strTryDate !== 'Invalid Date');
};

const convert = x => {
  if (typeof(x) === 'string') {
    if (isDate(x)) {
      return new Date(x);
    }
    else {
      var maybenum = x.replace(/,/g, '');
      return isNaN(maybenum) ? x : parseFloat(maybenum);
    }
  } else {
    return x === null ? NaN : x;
  }
};

const wrapper = root => {
  const div = document.createElement('div');
  div.style.flexGrow = 1;
  div.style.overflow = 'hidden';

  root.appendChild(div);
  root.style.display = 'flex';

  return div;
}

const createLegend = ({ names, colors, values }) => {
  const legendDiv = document.createElement('div');

  legendDiv.style.display = 'flex';
  legendDiv.style.position = 'absolute';
  legendDiv.style.right = '1em';
  legendDiv.style['font-size'] = '0.85em';
  legendDiv.style['max-width'] = '90%';
  legendDiv.style.overflow = 'auto';

  if (names && colors) {
    names.forEach((name, i) => {
      const legendItem = document.createElement('div');

      legendItem.style.display = 'flex';
      legendItem.style['align-items'] = 'center';
      legendItem.style['margin-right'] = '1em';

      legendItem.innerHTML = `
        <span style="background: ${colors[i % colors.length]}; width: 1em; height: 1em; margin-right: 0.5em"></span>
        ${name}
      `;
      legendDiv.appendChild(legendItem);
    });
  }

  return legendDiv;
};

const isArquero = function(x) {
  return x && typeof(x._data) === 'object';
}

const isDanfo = function(x) {
  return x && typeof(x.col_data_tensor) === 'object';
}

const isPyodide = function(x) {
  return x && x.type === 'DataFrame';
}

const toRowsFromArquero = async function(x) {
  var rows = [];
  x.scan(function(i, data) {
    const row = Object.fromEntries(Object.keys(data).map(e => [e, data[e].get(i)]));
    rows.push(row);
  }, true);

  return rows;
}

const toRowsFromDanfo = async function(x) {
  return JSON.parse(await x.to_json())
}

const toRowsFromPyodide = async function(x) {
  return JSON.parse(x.to_json(undefined, 'records'))
}

const arqueroEnsure = (e) => {
  if (typeof(aq) == 'undefined' || typeof(e.columns) == 'function') return e;

  var columns = {};
  var data = e._data;

  Object.keys(data).forEach(e => columns[e] = data[e].data);

  return aq.table(columns);
}

const toRows = async function(x) {
  if (isArquero(x)) {
    x = arqueroEnsure(x);
    return toRowsFromArquero(x);
  }
  else if (isPyodide(x)) return toRowsFromPyodide(x);
  else if (isDanfo(x)) return toRowsFromDanfo(x);
  return x;
}

const toArqueroFromRows = function(x) {
  return aq.from(x);
}

const toArquero = async function(x) {
  if (isArquero(x)) return x;
  else if (isDanfo(x)) return toArqueroFromRows(toRowsFromDanfo(x));
  return toArqueroFromRows(x);
}

export default {
  utils: {
    createLegend: createLegend,
    wrapper: wrapper,
    convert: convert,
    toRows: toRows,
    toArquero: toArquero,
  }
};
