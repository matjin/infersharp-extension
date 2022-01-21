var INFERSHARP_VERSION = "1.2";
var INFERSHARP_BINARY_URL = ("https://github.com/microsoft/infersharp/releases/download/v" 
                            + INFERSHARP_VERSION + "/infersharp-linux64-v" 
                            + INFERSHARP_VERSION + ".tar.gz");
var RUN_WSL_UBUNTU = "wsl ~ -d ubuntu -u root";
var INFERSHARP_FOLDER_NAME = "infersharp" + INFERSHARP_VERSION;
var CORELIB_FILENAME = "/System.Private.CoreLib.dll";
var CORELIB_PATH = INFERSHARP_FOLDER_NAME + "/Cilsil" + CORELIB_FILENAME;
var INFER_BINARIES = INFERSHARP_FOLDER_NAME + "/infer/lib/infer/infer/bin/infer";

export var INFERSHARP_TAR_GZ = "infersharp.tar.gz";
export var INFER_OUT = "infer-out/";
export var INSTALL_WSL_UBUNTU  = "wsl --install -d ubuntu";
export var INFERSHARP_FOLDER = "infersharp" + INFERSHARP_VERSION;
export var RUN_WSL = "wsl ~ -u root";
export var TRY_GET_INFERSHARP_BINARIES = ("do {" + RUN_WSL_UBUNTU +" wget " + INFERSHARP_BINARY_URL + " -O " + INFERSHARP_TAR_GZ + ";" + 
                                            "$success =$?; " + 
                                            "if (-not $success) { $MaxAttempts++ }; " + 
                                            "if ($MaxAttempts -ge 10) { " +
                                                "'Automatic install timeout -- please see manual setup steps'; exit; "+
                                            "};" + 
                                            "Start-Sleep -s 5;" + 
                                        "} " +
                                        "until ($success);");
export var UNZIP_BINARIES = [runWslUbuntu("tar -xvzf " +  INFERSHARP_TAR_GZ),
                             runWslUbuntu("mv infersharp " + INFERSHARP_FOLDER_NAME)].join( ' ; ');
export var CHECK_SETUP = runWsl("ls " + INFERSHARP_FOLDER);
export var SET_WSL_DEFAULT_UBUNTU = "wsl -s ubuntu";
export var MONITOR = ("do { Start-Sleep -s 60; $count = " + RUN_WSL_UBUNTU + 
                            " grep -wc 'Elapsed analysis time:' " + INFER_OUT + 
                            "logs; 'Methods analyzed: ' + $count.Split(' ')[0]; " + 
                      "} while ($true);");

export function copy(sourcePath: string, destinationPath: string) {
    return "cp " + sourcePath + " " + destinationPath;
}

export function move(sourcePath: string, destinationPath: string) {
    return "mv " + sourcePath + " " + destinationPath;
}

export function remove(path: string) {
    return "rm -rf " + path;
}

export function print(output: string) {
    return "echo '" + output + "'";
}

export function runWsl(command: string) {
    return "wsl ~ -u root " + command;
}

export function runWslUbuntu(command: string) {
    return "wsl ~ -u root -d ubuntu " + command;
}

export function translateAndMove(inputPath: string) {
    var coreLibCopy = inputPath + CORELIB_FILENAME; 

    var getCoreLib = copy(CORELIB_PATH, coreLibCopy);
    var translate = (INFERSHARP_FOLDER_NAME + "/Cilsil/Cilsil translate " + inputPath +
                    " --outcfg " + inputPath + "/cfg.json " +
                    " --outtenv " + inputPath + "/tenv.json "/* + "--extprogress"*/);
    var moveCfg = move(inputPath + "/cfg.json", "~/cfg.json");
    var moveTenv = move(inputPath + "/tenv.json", "~/tenv.json");
    var removeCoreLibCopy = remove(coreLibCopy);
    var removeOldOutput = remove(inputPath + "/" + INFER_OUT);

    return [runWsl(getCoreLib), runWsl(translate), 
            runWsl(moveCfg), runWsl(moveTenv), 
            runWsl(removeCoreLibCopy), runWsl(removeOldOutput)].join(' ; ');
}

export function inferAnalyze(inputPath: string) {
    var capture = INFER_BINARIES + " capture";
    var makeCaptured = "mkdir -p infer-out/captured";
    var inferAnalyzeJson = (INFER_BINARIES + " analyzejson " + 
                            " --debug-level 1 --pulse " +
                            "--sarif " + 
                            "--disable-issue-type PULSE_UNINITIALIZED_VALUE " +
                            "--disable-issue-type MEMORY_LEAK " +
                            "--disable-issue-type UNINITIALIZED_VALUE " +
                            "--cfg-json cfg.json --tenv-json tenv.json");
    var moveOutput = "cp -r ~/infer-out/ " + inputPath;
    return [runWsl(capture), runWsl(makeCaptured),
            runWsl(inferAnalyzeJson), runWsl(moveOutput)].join(' ; ');
}