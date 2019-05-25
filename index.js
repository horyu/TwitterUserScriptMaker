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
    const func = ifrm.contentWindow['add' + form.name];
    const feles = form.elements;
    switch (form.name) {
      case 'FixedInputText':
        func(feles.value.value);
        break;
      case 'InputText':
        func(feles.value.value);
        break;
      case 'Textarea':
        console.log(feles.rows.value);
        func(feles.value.value, feles.rows.value);
        break;
      case 'ToggleButton':
        func(feles.value.value, feles.checked.value);
        break;
    }
    ifrm.contentWindow.updateTA();
  });
}
