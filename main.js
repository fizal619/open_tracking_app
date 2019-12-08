const form = document.querySelector('form');
const tbody = document.querySelector('tbody');
const table = document.querySelector('table');


let packages = {};

const render = () => {
  tbody.innerHTML = '<img src="https://weeve.network/images/Loader.gif">';
  const packageKeys = Object.keys(packages);
  let bodyStr = '';

  packageKeys.reduce((p,c,i) => {
    if (packages[c].received) {
      return p.concat([c]);
    } else {
      return [c].concat(p);
    }
  }, [])
  .forEach(packageKey => {
    const package = packages[packageKey];
    bodyStr += `

    <tr>
      <td>${package.note}</td>
      <td>${package.tracking_number}</td>
      <td>${package.carrier}</td>
      <td>${package.status || '<img src="https://weeve.network/images/Loader.gif" height="40px">'}</td>
      <td>
        <button
          class="btn btn-sm btn-${package.received ? 'success' : 'primary'} btn-received"
          data-tracking_number="${package.tracking_number}">
          ${package.received ? 'Received' : 'Mark Received'}
          </button>
        <button
          class="btn btn-sm btn-danger btn-delete" data-tracking_number="${package.tracking_number}">
            Delete
        </button>
      </td>
    </tr>

    `;
  });
  tbody.innerHTML = bodyStr;
}

const update = async (coll) => {
  console.log("UPDATE");
  packages = {};

  try {
    const collection = coll ? coll.docs : await db.collection("tracking_checklist").get();
    collection.forEach(packageRef => {
      const package = packageRef.data();
      packages[package.tracking_number] = package;
    });
    render();
  } catch (e) {
    console.error(e);
  }

}

form.onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    tracking_number: e.target.trackingno.value,
    note: e.target.note.value,
    carrier: e.target.carrier.value,
    received: false
  }

  if (data.tracking_number == '') return 0;

  console.log(data);

  try {
    const write = await db.collection("tracking_checklist").doc(data.tracking_number).set(data);
  } catch (e) {
    console.error(e);
  }


  e.target.trackingno.value = '';
}

tbody.addEventListener('click', e =>{
  if (e.target.classList.contains('btn-received')) {
    db.collection("tracking_checklist")
    .doc(e.target.dataset.tracking_number)
    .set({
      ...packages[e.target.dataset.tracking_number],
      received: !packages[e.target.dataset.tracking_number].received
    })
    .then(console.log)
    .catch(console.error);
  }

  if (e.target.classList.contains('btn-delete')) {
    console.log("DELETE");
    db.collection("tracking_checklist")
      .doc(e.target.dataset.tracking_number)
      .delete()
      .then(console.log)
      .catch(console.error);

  }

});

db.collection("tracking_checklist")
  .onSnapshot(update);