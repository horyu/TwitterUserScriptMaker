const makeTag = (tagName, attrs = {}, text = null) => {
  const node = document.createElement(tagName);
  for (let attr in attrs) {
    node.setAttribute(attr, attrs[attr]);
  }
  if (text) {
    const textNode = document.createTextNode(text);
    node.appendChild(textNode);
  }
  return node;
}

const ifrm = document.getElementById('ifrm');
{
  const btn = document.getElementById('reset');
  btn.onclick = () => {
    for (const form of document.getElementsByTagName('form')) {
      form.reset();
    }
  };
}
{
  const btn = document.getElementById('reload');
  btn.onclick = () => {
    ifrm.contentDocument.location.reload(true);
  };
}

const arrangeArea = document.getElementById('arrange-area');
const datas = [];
datas.swap = (i, j) => {
  [[datas[i], datas[j]]] = [[datas[j], datas[i]]];
};

const data2func = (data) => {
  const f = ifrm.contentWindow['add' + data.name];
  const value = data.value;
  switch (data.name) {
    case 'FixedInputText':
      // InputText と同じ処理（違う関数）をする
    case 'InputText':
      return () => f(value);
    case 'Textarea':
      const rows = data.rows;
      return () => f(value, rows);
    case 'ToggleButton':
      const checked = data.checked;
      return () => f(value, checked);
  }
};

const datas2ifrm = () => {
  ifrm.contentWindow.oreForm.textContent = null;
  arrangeArea.textContent = null;
  for(let i = 0; i < datas.length; i++) {
    const data = datas[i];
    data2func(data)();
    addLi(data.name, data.value, i);
  }
  ifrm.contentWindow.updateTA();
}

const addLi = (() => {
  const makeButton = (text, func) => {
    const btn = makeTag('button', {}, text);
    btn.addEventListener('click', func);
    return btn;
  };

  return (name, value, index) => {
    const li = makeTag('li', {}, name + ": " + value);
    const downBtn = makeButton('↓', () => {
      if (datas[index+1]) {
        datas.swap(index, index+1);
        datas2ifrm();
      }
    });
    const upBtn = makeButton('↑', () => {
      if (datas[index-1]) {
        datas.swap(index-1, index);
        datas2ifrm();
      }
    });
    const removeBtn = makeButton('remove', () => {
      datas.splice(index, 1);
      datas2ifrm();
    });
    // DocumentFragmentはinsertAdjacentElementでエラーを起こすので、forEachで回す
    [downBtn, upBtn, removeBtn].forEach(ele => {
      li.insertAdjacentElement('afterbegin', ele);
    })
    arrangeArea.appendChild(li);
  };
})();

// FixedInputText
// InputText
// Textarea
// ToggleButton

for (const form of document.getElementsByTagName('form')) {
  // 実際のsubmitを中止
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  // makeボタンに機能を追加
  const submit = form.querySelector('input[type="submit"]');
  submit.addEventListener('click', () => {
    const feles = form.elements;
    const name = form.name;
    const value = feles.value.value;
    const data = { name, value };
    switch (form.name) {
      case 'FixedInputText':
        if (value === '') return;
        // InputText と同じdata構造
      case 'InputText':
        datas.push(Object.assign(data, {}));
        break;
      case 'Textarea':
        const rows = feles.rows.value;
        datas.push(Object.assign(data, { rows }));
        break;
      case 'ToggleButton':
        if (value === '') return;
        const checked = feles.checked.value;
        datas.push(Object.assign(data, { checked }));
        break;
    }
    datas2ifrm();
  });
}
