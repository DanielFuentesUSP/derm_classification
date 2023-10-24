$(document).ready(function () {
  const debug = false;
  if (debug) {
    var api_overlay_url = "http://10.65.34.100:8000/api-machiron/";
  }
  else {
    var api_overlay_url = "https://machiron.hc.fm.usp.br/api-machiron/";
  }
  const api_url = api_overlay_url+"sarcopenia/"
  const steps = ['1', '2', '3']
  const Queue = Swal.mixin({
    progressSteps: steps,
    showCancelButton: false,
    showConfirmButton: false,
    allowOutsideClick: false,
  })

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
// DEBUG
  // $('#img-result').empty();
  // $('#modal_img_result').modal('show');
  // $("#img-result").append(`<img id='theImg' style='width: 600px'; src='http://127.0.0.1:8010/images/sarcopenia/overlay_slice/exam_1689031220282.png/'/>`);
  // $("#img-sagital-result").append(`<img id='sagital' style='width: 400px'; src='http://127.0.0.1:8010/images/sarcopenia/overlay_slice/exam_1689031220282_sagital.png/'/>`); 

  dc0 = new DICOMZero();

  function show_working_loading(){
    $("#envioloading").LoadingOverlay("show", {
      // background  : "rgba(255, 113, 57, 0.1)",
      background  : "",
      image       : "",
      fontawesome : "fa fa-cog fa-spin"
    });
    $("#envioloading").LoadingOverlay("show");
    
  }

  function throw_error_message(msg = '') {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      html: `Algo errado aconteceu!<br> ${msg}`,
      // footer: '<a href="">Why do I have this issue?</a>'
    })
  }
  
  function send_file(file_anon){

    const onUploadProgress = event => {
      const percentCompleted = Math.round((event.loaded * 100) / event.total);
      $(".progress-bar").css("width", percentCompleted + "%").text(percentCompleted + "%");
      if (percentCompleted==100){
        console.log('upload completo')
        swal.close()
        Toast.fire({
          icon: 'success',
          title: 'O exame está sendo processado!'
        })
        show_working_loading()
      }
    };
  
    let apiUrl = api_url;    
    let config = { 
      header : {
        'Content-Type' : 'multipart/form-data'
      },
      onUploadProgress
    }
  
    var formData  =new FormData();
    formData.append('uploaded_file',file_anon)
    formData.append('height',$("#patient_height").val())
    axios.post(apiUrl,formData,config)
    .then((response)=>{
      console.log(response)
      console.log('retorno: ', response.data)
      $("#envioloading").LoadingOverlay("hide", true);
      $('#img-result').empty();
      $('#img-sagital-result').empty();
      $('#modal_img_result').modal('show');
      $("#img-result").append(`<img id='theImg' style='width: 600px'; src='${api_overlay_url}${response.data.img_overlay}.png/'/>`);
      if (response.data.img_overlay_sagital != null){
        $("#nav-sagital-tab").prop("disabled", false);
        $("#img-sagital-result").append(`<img id='sagital' style='width: 400px'; src='${api_overlay_url}${response.data.img_overlay}_sagital.png/'/>`);
        $("#nav-axial-tab").trigger("click");

      }
      else{
        $("#nav-sagital-tab").prop("disabled", true);

      }
      document.getElementById('muscle_area').innerHTML = `${response.data.muscle_area} cm²`
      document.getElementById('muscle_pixel').innerHTML = `${response.data.muscle_pixel} UH`
      document.getElementById('p_viscFat_subFat').innerHTML = `${response.data.p_viscFat_subFat}`
      document.getElementById('sub_fat_area').innerHTML = `${response.data.sub_fat_area} cm²`
      document.getElementById('visc_fat_area').innerHTML = `${response.data.visc_fat_area} cm²`
      if (response.data.muscle_area_height== 0){        
        // document.getElementById('muscle_area_height').innerHTML = `Não foi possível calcular`
        document.getElementById('muscle_area_height').innerHTML = ` 
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="Necessário informar altura para o cáculo de SMI.">
        <i class="bi bi-question-circle" style="font-size: 1.1rem;"></i>
      </span>`
  
      }else{        
        document.getElementById('muscle_area_height').innerHTML = `${response.data.muscle_area_height} cm² / m²`
      }

    }).catch(function (error) {
      console.log('error ',error.message);
      console.error(error)
      $("#envioloading").LoadingOverlay("hide", true);
      swal.close()
        if (error.message) {                                         
        // Request made and server responded
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
        
        throw_error_message(error.message);
      } else {
        throw_error_message();

      }
    });
  }

  function resetDICOMzero() {
    if (dc0.viewer) {
          dc0.viewer.reset();
          dc0.viewer.removeElement();
      }
    dc0.reset();
    dc0.datasets = [];
    dc0.dataTransfer = undefined;
    $("#datasetSlider").val(0);
    $("#datasetSlider").attr("max", 0);
    $("#dicomData").text("");
  }

  function zip_send_file() {
    Queue.fire({
      title: 'Enviando arquivo...',
      currentProgressStep: 2,
      // html: `Série selecionada: ${dc0.datasets[0].SeriesDescription} <br>Tempo de Aquisição: ${dc0.datasets[0].AcquisitionTime}
      html: `Série selecionada: ${dc0.datasets[0].SeriesDescription} <br>
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 0%;background:#e05929"" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">25%</div>
      </div> 
      `,
      showClass: { backdrop: 'swal2-noanimation' },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    console.log(dc0.datasets)

    var zip = new JSZip();
    dc0.datasets.forEach(function(dataset){
      dataesetBlob = dcmjs.data.datasetToBlob(dataset);
      // console.log(dataset)
      if (dataset.AcquisitionTime != null) {
        zip.file(dataset.InstanceNumber + '_' + dataset.SliceLocation + '_'+dataset.AcquisitionTime +'.dcm', dataesetBlob);
        }
      })
    resetDICOMzero();

    zip.generateAsync({type:"blob"})
    .then(function(content) {
      // if (debug){
      //   saveAs(content, "example.zip");
      // }
        var file_zip = new File([content], `exam_${new Date().getTime()}.zip`);
      send_file(file_zip);
    }, function(err){
        console.log(err)
    });
    
  }
  function dcm_send_file(dcm_anon) {
    console.log('dcm_send_file', dcm_anon);
    dataesetBlob = dcmjs.data.datasetToBlob(dcm_anon);
    var file = new File([dataesetBlob], `fatia_${new Date().getTime()}.dcm`);
    send_file(file);
  }

  function finish_anonymize_zip() {
    Queue.fire({
      title: 'Filtrando série SEM CONTRASTE...',
      currentProgressStep: 1,
      showClass: { backdrop: 'swal2-noanimation' },
    })

    console.log('seleciona serie')

    let array_series = new Array();
    dc0.datasets.map(dicom_atual => {
      let serie_array_index = array_series.findIndex((item => item.serie_uid === dicom_atual.serie_uid));
      if (serie_array_index == -1){
        count = 1;
        time = Number(dicom_atual.time);
        let dict = { 'serie_uid': dicom_atual.serie_uid, 'count': count, 'time': time }
        array_series.push(dict);
      }
      else {
        let serie_array = array_series[serie_array_index];
        count = serie_array.count + 1;
        time = serie_array.time + Number(dicom_atual.time);
        array_series[serie_array_index].count = count;
        array_series[serie_array_index].time = time;
      }
    });

    console.log('todas series encontradas', array_series);
    array_series_filtered = array_series.filter(serie =>  {
      if (serie.count > 30) {
        serie['mean_time'] = serie.time / serie.count;
        return serie;
      }
    });
    console.log("series selecionadas (count>50): ", array_series_filtered)

    let sem_cont = array_series_filtered.reduce(function(prev, curr) {
      return prev.mean_time < curr.mean_time ? prev : curr;
    });
    
    console.log('serie de menor tempo medio :', sem_cont)

    let filenames_sem_cont = dc0.datasets.filter(dataset => dataset.serie_uid == sem_cont.serie_uid );
    filenames_sem_cont = filenames_sem_cont.map(item => item.file_name);

    resetDICOMzero();

    const file = $('#img-dicom').prop("files");
    dc0.extractFromZipArrayBufferFileNames(file[0], filenames_sem_cont, zip_send_file);


    // let times = dc0.datasets.map(a => a.serie_uid);

    // const occurrences = times.reduce(function (acc, curr) {
    //   return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    // }, {});
    // console.log('occurrences (time e count)' ,occurrences)
    
    // times_of_interest = []
    // for (const [time, count_fatias, serie_desc] of Object.entries(occurrences)) {
    //   if (count_fatias > 50)
    //   times_of_interest.push({time, count_fatias, serie_desc})
    // }
    // console.log('times_of_interest ', times_of_interest)

    // sem_cont_time=Math.min(...times_of_interest.map(o => o.time))
    // console.log('tempo da serie sem contraste :', sem_cont_time)
    
    // let filenames_sem_cont = dc0.datasets.filter(dataset => dataset.time == sem_cont_time );
    // filenames_sem_cont = filenames_sem_cont.map(item => item.file_name);

    // resetDICOMzero();

    // const file = $('#img-dicom').prop("files");
    // dc0.extractFromZipArrayBufferFileNames(file[0], filenames_sem_cont, zip_send_file);
  }

  function anonimiza_zip() {
    try {
      resetDICOMzero();
      const file = $('#img-dicom').prop("files");
      console.log("Extracting reference image data...");
    
      dc0.extractFromZipArrayBuffer(file[0], finish_anonymize_zip);
      delete file
    }
    catch (err) {
      throw_error_message('Erro ao anonimizar exame');
      console.error('err', err)
    }

    
  }

  function anonimiza_dcm() {
    resetDICOMzero();
    const files = $('#img-dicom').prop("files");
    console.log("Anonimizando fatia...", files[0]);
    try {
      dc0.dataTransfer = files;
      console.log('dataTransfer', dc0.dataTransfer)
      dc0.readOneFile(dcm_send_file);
    }
    catch (err) {
      throw_error_message('Erro ao anonimizar dicom');
      console.error('err', err)
    }
  delete file
  
}

async function handle_dcm() {  
  await Swal.fire({
    title: 'Anonimizando tags DICOM!',
    timer: 2000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading()
      const b = Swal.getHtmlContainer().querySelector('b')
      timerInterval = setInterval(() => {
        b.textContent = Swal.getTimerLeft()
      }, 100)
    },
    willClose: () => {
      clearInterval(timerInterval)
    }
  });
      
    anonimiza_dcm();
 }
  
  $("#processaBtn").click( function(){
    console.log("inciando processamento")
    resetDICOMzero();

    var ext = document.getElementById('img-dicom')['value'].split('.').slice(-1)[0].toLowerCase();

    console.log('tipo de arquivo: ', ext);
    if (ext == "zip") {
      Queue.fire({
        title: 'Anonimizando DICOMs...',
        currentProgressStep: 0,
        showClass: { backdrop: 'swal2-noanimation' },
      })
      anonimiza_zip();
    }
    else if (ext == "dcm") {
      handle_dcm();
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Extensão inválida! (use dcm ou zip)'
      }) 
    }
    // let resp = processa()

  });
});


