$(window).on('load', function(){

  $("#processaBtn").click( function(){
    console.log("VAI EXAME")

    let fileInput = document.getElementById('img-dicom').files[0]
    console.log('file', fileInput)

  });
});

function onMyfileChange(fileInput) {
  if(fileInput.files[0] == undefined) {
      return ;
  }
  var filename = fileInput.files[0].name;
  // var filesize = fileInput.files[0].size;
  var reader = new FileReader();

  // var dc0 = new DICOMZero();
  reader.onload = function(ev) {
      JSZip.loadAsync(ev.target.result).then(function(zip) {
          console.log(zip.files) 
         let expectedDICOMFileCount = 0;

          Object.keys(zip.files).forEach(fileKey => {
            if (fileKey.endsWith(".dcm")) {
              console.log(fileKey + ' é um arquivo dicom')
              expectedDICOMFileCount += 1;
              zip.files[fileKey]
                    .async("arraybuffer")
                    .then(function(arrayBuffer) {
                      dicomData = dcmjs.data.DicomMessage.readFile(
                        arrayBuffer
                    );
                    console.log(typeof(dicomData))
                    console.log(dicomData)

                    let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);

                    dataset.PatientName = "Anonimo-machiron"
                    dataset.PatientID = "Anonimo-machiron"
                    dataset.BirthDate = "19010101"
                    dataset.StudyID = "000001"
                    dataset.StudyDate = "19010101"
                    dataset.AccessionNumber = "000001"
                    
                    dicomData.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);
                    let new_file_WriterBuffer = dicomData.write();
                    console.log(new_file_WriterBuffer)
                    console.log('myFile', new_file_WriterBuffer)
                    
                    // var bb = new Blob([new_file_WriterBuffer ], { type: 'text/plain' });                    
                    // console.log('dataset', dataset)
                    // console.log('bb', bb)
                    // var a = document.createElement('a');
                    // a.download = 'download.dcm';
                    // a.href = window.URL.createObjectURL(bb);
                    // a.click();
              });
              
            }
        });

          // dc0.zip = zip;
          // let expectedDICOMFileCount = 0; 
          
      }).catch(function(err) {
          console.error("Failed to open", filename, " as ZIP file");
      }) 

  }; 
  reader.onerror = function(err) {
      console.error("Failed to read file", err);
  }
  reader.readAsArrayBuffer(fileInput.files[0]);


}
