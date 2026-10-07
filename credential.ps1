param([ValidateSet('protect','unprotect')][string]$Mode)
$ErrorActionPreference='Stop'
$credentialInput=[Console]::In.ReadToEnd()
if ($Mode -eq 'protect') {
 $secureValue=ConvertTo-SecureString -String $credentialInput -AsPlainText -Force
 [Console]::Out.Write((ConvertFrom-SecureString -SecureString $secureValue))
} else {
 $secureValue=ConvertTo-SecureString -String $credentialInput
 $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
 try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) }
 finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
