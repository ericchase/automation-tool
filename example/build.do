build "./my folder" "this shouldn't get parsed"
watch ./folder *.js *.ts "this should be a string"
=> copy ./folder "./other folder"